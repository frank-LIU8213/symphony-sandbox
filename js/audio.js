/** @type {Map<string, HTMLAudioElement>} */
const audioCache = new Map();

/** @type {AudioAsset[]} */
let audioAssets = [];

/** @type {number} */
let masterVolume = 1;

/**
 * @param {string} id
 * @param {number} [volume=1]
 */
export function play(id, volume = 1) {
  let audio = audioCache.get(id);

  if (!audio) {
    const asset = audioAssets.find((a) => a.id === id);
    if (!asset) {
      console.warn(`[Pluto Audio] Asset not found: ${id}`);
      return;
    }
    audio = new Audio(asset.src);
    audio.preload = 'auto';
    if (asset.type === 'ambient') {
      audio.loop = true;
    }
    audioCache.set(id, audio);
  }

  audio.volume = clamp(masterVolume * volume, 0, 1);

  // Reset SFX to start from beginning; leave ambient loops running.
  const asset = audioAssets.find((a) => a.id === id);
  if (asset && asset.type === 'sfx') {
    audio.currentTime = 0;
  }

  audio.play().catch((err) => {
    console.warn(`[Pluto Audio] Failed to play "${id}":`, err);
  });
}

/**
 * @param {string} [id]
 */
export function pauseAll(id) {
  if (id) {
    const audio = audioCache.get(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  } else {
    audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

/**
 * @param {number} v
 */
export function setMasterVolume(v) {
  masterVolume = clamp(v, 0, 1);
  audioCache.forEach((audio) => {
    audio.volume = masterVolume;
  });
}

/**
 * @param {AudioAsset[]} assets
 */
export function registerAudioAssets(assets) {
  audioAssets = assets;
}

/**
 * @returns {AudioAsset[]}
 */
export function getAudioAssets() {
  return audioAssets;
}

export function initAudio() {
  // Audio is ready to play on first user interaction.
  // The browser requires a user gesture before audio can be used.
  // We set up a one-time listener to unlock audio on any click/touch.
  const unlockAudio = () => {
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
}

/**
 * @param {number} v
 * @returns {number}
 */
function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
