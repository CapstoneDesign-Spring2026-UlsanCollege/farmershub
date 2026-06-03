const NOTIFICATION_SOUND_KEY = 'fh_notification_sound';
const DEFAULT_NOTIFICATION_SOUND = 'hens';
const NOTIFICATION_SOUND_MAX_MS = 3500;

const NOTIFICATION_SOUNDS = Object.freeze({
  hens: {
    label: 'Hens',
    src: new URL('../audio/notification-hens.mp3', import.meta.url).href,
  },
  cat: {
    label: 'Cat',
    src: new URL('../audio/notification-cat-meow.mp3', import.meta.url).href,
  },
  silent: {
    label: 'Silent',
    src: '',
  },
});

let activeAudio = null;
let soundStopTimer = null;

function normalizeNotificationSound(soundName) {
  return Object.prototype.hasOwnProperty.call(NOTIFICATION_SOUNDS, soundName)
    ? soundName
    : DEFAULT_NOTIFICATION_SOUND;
}

function getCurrentNotificationSound() {
  return normalizeNotificationSound(localStorage.getItem(NOTIFICATION_SOUND_KEY));
}

function saveNotificationSoundPreference(soundName) {
  const normalizedSound = normalizeNotificationSound(soundName);
  localStorage.setItem(NOTIFICATION_SOUND_KEY, normalizedSound);
  return normalizedSound;
}

function getNotificationSoundOptions() {
  return Object.entries(NOTIFICATION_SOUNDS).map(([value, config]) => ({
    value,
    label: config.label,
  }));
}

function hydrateNotificationSoundSelect(selectEl) {
  if (!selectEl) return;

  selectEl.replaceChildren();
  getNotificationSoundOptions().forEach((sound) => {
    const option = document.createElement('option');
    option.value = sound.value;
    option.textContent = sound.label;
    selectEl.appendChild(option);
  });
  selectEl.value = getCurrentNotificationSound();
}

function stopNotificationSound() {
  window.clearTimeout(soundStopTimer);
  if (!activeAudio) return;

  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

async function playNotificationSound(soundName = getCurrentNotificationSound()) {
  const normalizedSound = normalizeNotificationSound(soundName);
  const soundConfig = NOTIFICATION_SOUNDS[normalizedSound];
  if (!soundConfig?.src) return;

  try {
    stopNotificationSound();
    const audio = new Audio(soundConfig.src);
    activeAudio = audio;
    await audio.play();
    soundStopTimer = window.setTimeout(stopNotificationSound, NOTIFICATION_SOUND_MAX_MS);
  } catch (error) {
    console.info('Notification sound needs a user interaction first.', error);
  }
}

export {
  getCurrentNotificationSound,
  hydrateNotificationSoundSelect,
  playNotificationSound,
  saveNotificationSoundPreference,
};
