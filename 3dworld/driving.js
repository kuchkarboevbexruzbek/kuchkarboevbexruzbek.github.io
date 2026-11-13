import { onDeviceChoice } from './device.js';
// Use the same terrain mesh and water plane as the vehicle physics.
export function shorelineSegments(geometry, seaLevel) {
  const vertices = geometry.attributes.position;
  const indices = geometry.index;
  const segments = [];
  for (let face = 0; face < indices.count; face += 3) {
    const crossings = [];
    for (let edge = 0; edge < 3; edge++) {
      const a = indices.getX(face + edge);
      const b = indices.getX(face + (edge + 1) % 3);
      const ya = vertices.getY(a), yb = vertices.getY(b);
      if ((ya >= seaLevel) === (yb >= seaLevel)) continue;
      const t = (seaLevel - ya) / (yb - ya);
      crossings.push({
        x: vertices.getX(a) + t * (vertices.getX(b) - vertices.getX(a)),
        z: vertices.getZ(a) + t * (vertices.getZ(b) - vertices.getZ(a))
      });
    }
    if (crossings.length === 2) segments.push(crossings);
  }
  return segments;
}

export function closestCoast(segments, position) {
  let minSquared = Infinity, x = 0, z = 0, onLand = false;
  for (const [a,b] of segments) {
    const dx = b.x - a.x, dz = b.z - a.z;
    if ((a.z > position.z) !== (b.z > position.z) &&
        position.x < a.x + dx * (position.z - a.z) / dz) onLand = !onLand;
    const length = dx * dx + dz * dz;
    const t = length ? Math.max(0, Math.min(1, ((position.x-a.x)*dx + (position.z-a.z)*dz) / length)) : 0;
    const offsetX = a.x + t * dx - position.x;
    const offsetZ = a.z + t * dz - position.z;
    const squared = offsetX * offsetX + offsetZ * offsetZ;
    if (squared < minSquared) { minSquared = squared; x = offsetX; z = offsetZ; }
  }
  return {x, z, distance: onLand ? 0 : Math.sqrt(minSquared)};
}

// Clockwise from forward, in the horizontal XZ plane (Three.js uses +Y up).
export function bearing(target, forwardX, forwardZ) {
  return Math.atan2(-target.x * forwardZ + target.z * forwardX,
    target.x * forwardX + target.z * forwardZ) * 180 / Math.PI;
}

export function turnHint(angle) {
  if (Math.abs(angle) < 20) return 'To‘g‘ri yuring';
  if (Math.abs(angle) > 150) return 'Orqaga buriling';
  return angle < 0 ? 'Chapga buriling' : 'O‘ngga buriling';
}

export function setupDriving(game) {
  const hud = document.querySelector('.drive-hud');
  const speed = hud.querySelector('.drive-speed strong');
  const compass = hud.querySelector('.drive-compass');
  const needle = compass.querySelector('.drive-needle');
  const hint = compass.querySelector('strong');
  const distance = compass.querySelector('small');
  const segments = shorelineSegments(game.resources.terrainModel.scene.children[0].geometry, game.water.surfaceElevation);
  let device = null;
  const canDrive = () => device !== null && game.reveal.step === 2 && game.player.state === 1 &&
    game.inputs.checkCategory(game.inputs.actions.get('forward')) &&
    game.menu.state === game.menu.constructor.CLOSED && game.modals.state === game.modals.constructor.CLOSED;
  const enableTouch = setupTouch(game, canDrive);
  onDeviceChoice(value => {
    device = value;
    const modes = game.inputs.constructor;
    game.inputs.updateMode(value === 'phone' ? modes.MODE_TOUCH : modes.MODE_MOUSEKEYBOARD);
    enableTouch(value === 'phone');
  });
  let entered = false;
  game.ticker.events.on('tick', () => {
    if (!entered && device && game.reveal.step === 0 && game.inputs.actions.has('introStart')) {
      entered = true;
      game.inputs.events.trigger('introStart');
    }
  }, 11);
  let nextSample = 0, coast;
  game.ticker.events.on('tick', () => {
    hud.hidden = !canDrive();
    if (hud.hidden) { nextSample = 0; return; }
    const kmh = String(Math.round((game.physicalVehicle.xzSpeed || 0) * 3.6));
    if (speed.textContent !== kmh) speed.textContent = kmh;
    if (performance.now() >= nextSample) {
      coast = closestCoast(segments, game.player.position);
      nextSample = performance.now() + 120;
      compass.hidden = !Number.isFinite(coast.distance) || coast.distance < (compass.hidden ? 120 : 100);
    }
    if (!compass.hidden && coast) {
      const matrix = game.view.camera.matrixWorld.elements;
      const angle = bearing(coast, -matrix[8], -matrix[10]);
      needle.style.transform = 'rotate(' + angle + 'deg)';
      const forward = game.physicalVehicle.forward;
      const turn = turnHint(bearing(coast, forward.x, forward.z));
      const range = 'Qirg‘oqqacha ' + Math.round(coast.distance) + ' m';
      if (hint.textContent !== turn) hint.textContent = turn;
      if (distance.textContent !== range) distance.textContent = range;
    }
  }, 11);
}

function setupTouch(game, canDrive) {
  const panel = document.querySelector('.drive-controls');
  const wheel = panel.querySelector('.drive-wheel');
  const gas = panel.querySelector('.drive-gas');
  const reverse = panel.querySelector('.drive-reverse');
  const brake = panel.querySelector('.drive-brake');
  const settings = document.querySelector('.drive-settings');
  const select = settings.querySelector('select');
  const notice = settings.querySelector('[role=status]');
  let enabled = false;
  const clamp = value => Math.max(-1, Math.min(1, value));
  let steering = 0, wheelId = null, lastAngle = 0, rotation = 0;
  let gasId = null, brakeId = null, reverseId = null, neutral = null, gyroActive = false, generation = 0, sensorTimer;
  let active = false;
  const screenAngle = () => screen.orientation?.angle ?? window.orientation ?? 0;
  const modeKey = 'island.steering';
  function remember(value) { try { localStorage.setItem(modeKey,value); } catch {} }
  function reset() {
    steering = rotation = 0;
    wheelId = gasId = brakeId = reverseId = neutral = null;
    reverse.classList.remove('held');
    wheel.style.setProperty('--turn','0deg');
    gas.classList.remove('held'); brake.classList.remove('held');
  }
  function readSensor(event) {
    if (!Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    clearTimeout(sensorTimer);
    const radians = Math.PI / 180, angle = screenAngle() * radians;
    const beta = event.beta * radians, gamma = event.gamma * radians;
    const lateral = Math.sin(gamma) * Math.cos(beta) * Math.cos(angle) + Math.sin(beta) * Math.sin(angle);
    if (!gyroActive || !active) { neutral = null; return; }
    if (neutral === null) neutral = lateral;
    const tilt = lateral-neutral;
    steering = Math.abs(tilt) < 0.035 ? 0 : clamp(tilt / 0.48);
  }
  function useWheel(message = '') {
    generation++; clearTimeout(sensorTimer);
    window.removeEventListener('deviceorientation',readSensor);
    gyroActive = false; wheel.hidden = false; select.value = 'wheel';
    notice.textContent = message; remember('wheel'); reset();
  }
  async function useGyro(fromGesture) {
    const attempt = ++generation;
    const sensor = window.DeviceOrientationEvent;
    try {
      if (!sensor || !window.isSecureContext) throw new Error();
      if (typeof sensor.requestPermission === 'function') {
        if (!fromGesture) { useWheel('Giroskopni yoqish uchun uni shu yerda tanlang.'); return; }
        if (await sensor.requestPermission() !== 'granted') throw new Error();
      }
      if (attempt !== generation) return;
      reset(); gyroActive = true; wheel.hidden = true; select.value = 'gyro'; remember('gyro');
      notice.textContent = 'Telefonni qulay tuting. Burilish uchun uni yon tomonga eging.';
      window.addEventListener('deviceorientation',readSensor);
      sensorTimer = setTimeout(() => useWheel('Sensordan signal kelmadi. Ekrandagi rul yoqildi.'),3500);
    } catch { if (attempt === generation) useWheel('Giroskop ishlamadi. Ekrandagi rul yoqildi.'); }
  }
  select.addEventListener('change', () => select.value === 'gyro' ? useGyro(true) : useWheel());
  settings.querySelector('button').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
      await screen.orientation?.lock?.('landscape');
    } catch {}
    notice.textContent = innerWidth >= innerHeight ? 'Gorizontal ko‘rinish yoqildi.' : 'Telefonni yon tomonga burang.';
  });
  const angleAt = event => {
    const box = wheel.getBoundingClientRect();
    return Math.atan2(event.clientY-box.top-box.height/2,event.clientX-box.left-box.width/2) * 180 / Math.PI;
  };
  function hold(button, start, stop) {
    button.addEventListener('pointerdown', event => {
      if (!enabled || !canDrive() || event.button !== 0 || start(event) === false) return;
      event.preventDefault(); button.setPointerCapture(event.pointerId);
    });
    for (const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name,stop);
  }
  hold(wheel, event => {
    if (wheelId !== null) return false;
    wheelId = event.pointerId; lastAngle = angleAt(event);
  }, event => {
    if (event.pointerId !== wheelId) return;
    wheelId = null; steering = rotation = 0; wheel.style.setProperty('--turn','0deg');
  });
  wheel.addEventListener('pointermove', event => {
    if (wheelId !== event.pointerId) return;
    const angle = angleAt(event);
    rotation = Math.max(-100,Math.min(100,rotation + ((angle-lastAngle+540)%360-180)));
    lastAngle = angle; steering = rotation/100;
    wheel.style.setProperty('--turn',rotation+'deg');
  });
  hold(gas, e => {
    if (gasId !== null) return false;
    gasId = e.pointerId; gas.classList.add('held');
  }, e => { if (gasId === e.pointerId) { gasId = null; gas.classList.remove('held'); } });
  hold(reverse, e => {
    if (reverseId !== null) return false;
    reverseId = e.pointerId; reverse.classList.add('held');
  }, e => { if (reverseId === e.pointerId) { reverseId = null; reverse.classList.remove('held'); } });
  hold(brake, e => {
    if (brakeId !== null) return false;
    brakeId = e.pointerId; brake.classList.add('held');
  }, e => { if (brakeId === e.pointerId) { brakeId = null; brake.classList.remove('held'); } });
  addEventListener('blur',reset);
  document.addEventListener('visibilitychange',reset);
  window.addEventListener('orientationchange',reset);
  screen.orientation?.addEventListener?.('change',reset);
  // Player reads conventional inputs at priority 1, then vehicle physics consumes these values at 2.
  game.ticker.events.on('tick', () => {
    const driving = enabled && canDrive() && !document.hidden;
    if (active && !driving) reset();
    active = driving; panel.hidden = !driving;
    if (!driving) return;
    if (gyroActive || wheelId !== null) game.player.steering = -steering;
    if (gasId !== null) game.player.accelerating = 1;
    if (reverseId !== null) {
      game.player.accelerating = gasId === null ? -1 : 0;
      game.player.boosting = 0; game.player.boostLatched = false;
    }
    if (brakeId !== null) {
      game.player.accelerating = game.player.boosting = 0;
      game.player.boostLatched = false; game.player.braking = 1;
    }
  },1);
  return value => {
    enabled = value; active = false; reset();
    settings.hidden = !value; panel.hidden = true;
    if (value) {
      try { if (localStorage.getItem(modeKey) === 'gyro') useGyro(false); } catch {}
    } else {
      generation++; clearTimeout(sensorTimer);
      window.removeEventListener('deviceorientation',readSensor);
      gyroActive = false; wheel.hidden = false; select.value = 'wheel';
    }
  };
}
