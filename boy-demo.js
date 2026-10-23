import * as THREE from '/vendor/three.module.min.js';

const anchor = document.querySelector('#maydon');
if (anchor) {
  anchor.insertAdjacentHTML('afterend', `
    <section class="boy-lab section" id="uchd-laboratoriya"><div class="wrap">
      <div class="section-head reveal visible"><div><div class="eyebrow">WEBGL / SHAXSIY TAJRIBA</div><h2>BOLA SAHNAGA<br><span>KIRDI.</span></h2></div><p>Har bir tugma boshqa qiliqni ishga tushiradi. Avval salomlashuvni sinab ko‘ring.</p></div>
      <div class="boy-shell reveal visible"><div class="boy-copy"><span class="boy-kicker">LOW-POLY PERSONAJ / 01</span><h3>SALOM,<br>MEN BEXRUZBEK.</h3><p>Bu personaj g‘oyani oddiy ekrandan kichik hikoyaga aylantiradi.</p><div class="boy-actions" role="group" aria-label="Bolaning qiliqlari"><button class="boy-action active" data-pose="enter">Sahnaga kirish</button><button class="boy-action greeting" data-pose="wave">Salomlashuv</button><button class="boy-action" data-pose="think">O‘ylash</button><button class="boy-action" data-pose="dance">Raqs</button><button class="boy-action" data-pose="jump">Sakrash</button><button class="boy-action" data-pose="sit">O‘tirish</button></div><div class="voice-slot"><span>ELEVENLABS OVOZI</span><b>Salomlashuv ovoz bilan ishlaydi.</b><small>“Salomlashuv” tugmasini bosing.</small></div></div><div class="boy-stage" aria-label="Harakatlanuvchi low-poly bola" tabindex="0"><canvas></canvas><div class="boy-dialog" aria-live="polite">Sahna tayyor.</div><span class="boy-hint">USHLAB AYLANTIRING ↗</span></div><audio class="greeting-audio" src="/assets/salomlashuv.mp3" preload="none" hidden></audio></div>
    </div></section>`);

  const section = anchor.nextElementSibling;
  const stage = section.querySelector('.boy-stage');
  const canvas = stage.querySelector('canvas');
  const dialog = stage.querySelector('.boy-dialog');
  const greetingAudio = section.querySelector('.greeting-audio');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
  const hemi = new THREE.HemisphereLight('#fffdf5', '#3c7655', 2.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff8d5', 2.6); sun.position.set(3, 5, 4); sun.castShadow = true; scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .22 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(22, 22, '#087b4b', '#087b4b'); grid.material.transparent = true; grid.material.opacity = .14; scene.add(grid);
  const mat = color => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: .82 });
  const skin = mat('#e9b48f'), skinDark = mat('#d69a74'), hair = mat('#15151b'), eye = mat('#201b1b'), frame = mat('#2d2631'), jacket = mat('#1c2631'), shirt = mat('#f4f4f7'), pants = mat('#1e2430'), shoe = mat('#f2eee9'), sole = mat('#d8d1ca'), lens = new THREE.MeshStandardMaterial({ color: '#a99bc9', transparent: true, opacity: .34, flatShading: true });
  const box = (parent, size, material, position, rotation = [0, 0, 0]) => { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; };
  const group = (parent, position) => { const g = new THREE.Group(); g.position.set(...position); parent.add(g); return g; };
  const root = group(scene, [0, .93, 0]);
  box(root, [.4, .18, .24], pants, [0, -.02, 0]);
  const torso = group(root, [0, .02, 0]); box(torso, [.4, .58, .22], shirt, [0, .3, 0]); box(torso, [.46, .6, .12], jacket, [0, .3, -.07]); box(torso, [.13, .6, .08], jacket, [.165, .3, .09]); box(torso, [.13, .6, .08], jacket, [-.165, .3, .09]); box(torso, [.13, .12, .13], skin, [0, .65, 0]);
  const head = group(torso, [0, .68, 0]); box(head, [.4, .44, .38], skin, [0, .24, 0]); box(head, [.46, .14, .44], hair, [0, .45, -.01]); box(head, [.44, .3, .1], hair, [0, .3, -.18]); box(head, [.2, .14, .22], hair, [-.1, .56, 0], [0, 0, .25]); box(head, [.16, .12, .2], hair, [.14, .54, .02], [0, 0, -.2]); box(head, [.12, .075, .012], lens, [.095, .27, .205]); box(head, [.12, .075, .012], lens, [-.095, .27, .205]); box(head, [.047, .024, .016], eye, [.095, .27, .215]); box(head, [.047, .024, .016], eye, [-.095, .27, .215]); box(head, [.3, .014, .014], frame, [0, .298, .214]); box(head, [.012, .09, .014], frame, [.16, .27, .212]); box(head, [.012, .09, .014], frame, [-.16, .27, .212]); box(head, [.05, .09, .05], skinDark, [0, .18, .215]); box(head, [.105, .018, .015], eye, [0, .09, .215]);
  const makeArm = side => { const shoulder = group(torso, [side * .31, .54, 0]); box(shoulder, [.18, .18, .19], jacket, [0, 0, 0]); box(shoulder, [.15, .34, .16], jacket, [0, -.18, 0]); const elbow = group(shoulder, [0, -.35, 0]); box(elbow, [.14, .32, .15], jacket, [0, -.16, 0]); box(elbow, [.09, .1, .08], skin, [0, -.37, 0]); return { shoulder, elbow }; };
  const makeLeg = side => { const hip = group(root, [side * .1, 0, 0]); box(hip, [.19, .43, .2], pants, [0, -.21, 0]); const knee = group(hip, [0, -.42, 0]); box(knee, [.17, .43, .18], pants, [0, -.21, 0]); const ankle = group(knee, [0, -.42, 0]); box(ankle, [.2, .07, .3], shoe, [0, -.04, .06]); box(ankle, [.21, .03, .32], sole, [0, -.075, .06]); return { hip, knee }; };
  const L = makeArm(1), R = makeArm(-1), LL = makeLeg(1), RL = makeLeg(-1);
  const chair = group(scene, [0, 0, -.05]); const wood = mat('#554335'); box(chair, [.58,.09,.48], wood, [0,.47,0]); box(chair, [.58,.52,.07], wood, [0,.76,-.2]); [[-.23,-.17],[.23,-.17],[-.23,.17],[.23,.17]].forEach(([x,z]) => box(chair, [.06,.45,.06], wood, [x,.22,z])); box(chair, [.48,.05,.04], mat('#8d7158'), [0,.87,-.155]); chair.visible = false;
  const poses = {
    idle: t => ({ bodyY: 0, torsoY: 0, headY: Math.sin(t * .7) * .1, ls: 0, rs: 0, le: .1, re: .1, lh: 0, rh: 0, lk: 0, rk: 0 }),
    wave: t => ({ bodyY: 0, torsoY: 0, headY: -.15, ls: 0, rs: -2.05, le: .1, re: -.42, lh: 0, rh: 0, lk: 0, rk: 0, wrist: Math.sin(t * 10) * .45 }),
    think: () => ({ bodyY: 0, torsoY: .05, headY: -.18, ls: -.45, rs: -1.0, le: -1.55, re: -2.05, lh: .08, rh: .08, lk: .12, rk: .12 }),
    dance: t => { const s = Math.sin(t * 7); return { bodyY: -.04 - .04 * Math.abs(s), torsoY: s * .22, headY: -s * .1, ls: -1.6 - s, rs: -1.6 + s, le: -1.1, re: -1.1, lh: .3 * Math.cos(t * 7), rh: -.3 * Math.cos(t * 7), lk: .4 + .35 * Math.max(0,s), rk: .4 + .35 * Math.max(0,-s) }; },
    jump: t => { const h = Math.max(0, Math.sin((t % 1.5) / 1.5 * Math.PI)); return { bodyY: .55 * h, torsoY: 0, headY: 0, ls: -2.5, rs: -2.5, le: -.2, re: -.2, lh: .35 + .5 * h, rh: .35 + .5 * h, lk: 1.1 * h + .25, rk: 1.1 * h + .25 }; },
    sit: t => ({ bodyY: -.27, torsoY: 0, headY: Math.sin(t * .5) * .07, ls: -.32, rs: -.32, le: -.82, re: -.82, lh: -1.48, rh: -1.48, lk: 1.48, rk: 1.48 })
  };
  let pose = 'idle', entry = 1, entering = false, visible = false, raf = 0, drag = false, px = 0, py = 0, orbitX = .5, orbitY = 1.35;
  const cur = { bodyY:0, torsoY:0, headY:0, ls:0,rs:0,le:0,re:0,lh:0,rh:0,lk:0,rk:0,wrist:0 };
  const resize = () => { const { width, height } = stage.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); }; new ResizeObserver(resize).observe(stage); resize();
  const setActive = name => section.querySelectorAll('.boy-action').forEach(item => item.classList.toggle('active', item.dataset.pose === name));
  const playGreeting = () => { greetingAudio.currentTime=0; greetingAudio.play().catch(() => { dialog.textContent='Salom! 👋 Ovoz uchun Salomlashuv tugmasini bosing.'; }); };
  const render = now => { if (!visible || document.hidden) { raf = 0; return; } const t = now / 1000; const target = poses[pose](t); if (entering) { const stride = Math.sin(t * 12); target.lh = stride * .68; target.rh = -stride * .68; target.lk = Math.max(0, -stride) * .55; target.rk = Math.max(0, stride) * .55; target.ls = -stride * .4; target.rs = stride * .4; entry = Math.min(1, entry + .012); if (entry === 1) { entering = false; pose = 'wave'; setActive('wave'); dialog.textContent = copy.wave; playGreeting(); } } Object.keys(cur).forEach(key => cur[key] += ((target[key] || 0) - cur[key]) * .12); root.position.x = -3.3 * (1 - entry); root.position.y = .93 + cur.bodyY; torso.rotation.y = cur.torsoY; head.rotation.y = cur.headY; L.shoulder.rotation.x = cur.ls; R.shoulder.rotation.x = cur.rs; L.elbow.rotation.x = cur.le; R.elbow.rotation.x = cur.re; R.elbow.rotation.z = cur.wrist; LL.hip.rotation.x = cur.lh; RL.hip.rotation.x = cur.rh; LL.knee.rotation.x = cur.lk; RL.knee.rotation.x = cur.rk; chair.visible = pose === 'sit'; grid.position.z = -(t * (pose === 'dance' ? .55 : .18) % 1); camera.position.set(5 * Math.sin(orbitY) * Math.sin(orbitX), 1.2 + 5 * Math.cos(orbitY), 5 * Math.sin(orbitY) * Math.cos(orbitX)); camera.lookAt(0, .95 + (pose === 'sit' ? -.16 : 0), 0); renderer.render(scene, camera); raf = requestAnimationFrame(render); };
  const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(render); }; new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); run(); }, { threshold:.15 }).observe(stage); document.addEventListener('visibilitychange', run);
  stage.addEventListener('pointerdown', e => { drag = true; px = e.clientX; py = e.clientY; stage.setPointerCapture(e.pointerId); }); stage.addEventListener('pointermove', e => { if (!drag) return; orbitX -= (e.clientX-px)*.008; orbitY = Math.min(1.7, Math.max(.55, orbitY-(e.clientY-py)*.006)); px=e.clientX; py=e.clientY; }); stage.addEventListener('pointerup', () => drag=false); stage.addEventListener('pointercancel', () => drag=false);
  stage.addEventListener('keydown', e => { const step = { ArrowLeft:[-.16,0], ArrowRight:[.16,0], ArrowUp:[0,-.12], ArrowDown:[0,.12] }[e.key]; if (step) { e.preventDefault(); orbitX += step[0]; orbitY = Math.min(1.7, Math.max(.55, orbitY + step[1])); } });
  const copy = { enter:'Bola sahnaga kirdi.', wave:'Salom! 👋 Ovoz ijro etilyapti.', think:'Yangi g‘oya haqida o‘ylayapman.', dance:'Kayfiyat bor — raqs boshlandi!', jump:'Sakrashga tayyor!', sit:'Bir oz o‘tirib, g‘oyani yig‘amiz.' };
  section.querySelectorAll('.boy-action').forEach(button => button.addEventListener('click', () => { const next = button.dataset.pose; setActive(next); if (next === 'enter') { pose='idle'; entry=0; entering=true; dialog.textContent='Chap tomondan yurib kelyapman...'; greetingAudio.pause(); greetingAudio.currentTime=0; return; } entering=false; pose=next; entry=1; if (next === 'wave') playGreeting(); else { greetingAudio.pause(); greetingAudio.currentTime=0; } dialog.textContent = copy[next]; }));
}
