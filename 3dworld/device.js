const dialog = document.querySelector('#drive-device');
const deviceSelect = document.querySelector('#drive-device-change');
let device = null;
const listeners = new Set();

export function onDeviceChoice(listener) {
  listeners.add(listener);
  if (device) listener(device);
}

function choose(value) {
  device = value;
  document.documentElement.dataset.driveDevice = value;
  document.documentElement.classList.toggle('drive-touch', value === 'phone');
  deviceSelect.value = value;
  if (dialog.open) dialog.close();
  for (const listener of listeners) listener(value);
}

dialog.addEventListener('cancel', event => event.preventDefault());
for (const button of dialog.querySelectorAll('[data-device]')) {
  button.addEventListener('click', () => choose(button.dataset.device));
}
deviceSelect.addEventListener('change', () => choose(deviceSelect.value));
dialog.showModal();
