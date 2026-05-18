import { AudioAsset } from './types.js';

/** @type {Map<string, HTMLAudioElement>} */
const audioCache = new Map();

/**
 * @param {string} id
 * @param {number} [volume=1]
 */
export function play(id, volume = 1) {
  // TODO: implement
}

/**
 * @param {string} [id]
 */
export function pauseAll(id) {
  // TODO: implement
}

/**
 * @param {number} v
 */
export function setMasterVolume(v) {
  // TODO: implement
}

export function initAudio() {
  // TODO: implement
}