/** Settings persistence and UI binding. */

const DEFAULTS = {
  workDuration: 1500,  // seconds
  breakDuration: 300,
  soundEnabled: true,
  backgroundTheme: 'default',
};

export class Settings {
  /**
   * @param {Object} [defaults] – overrides
   */
  constructor(defaults = {}) {
    throw new Error('Not implemented');
  }

  /** @returns {Object} current settings from localStorage (merged with defaults). */
  load() { throw new Error('Not implemented'); }

  /** @param {Object} state */
  save(state) { throw new Error('Not implemented'); }

  /** @param {string} key */
  get(key) { throw new Error('Not implemented'); }

  /** @param {string} key @param {*} value */
  set(key, value) { throw new Error('Not implemented'); }

  /** @param {(changed: Object) => void} callback */
  onChange(callback) { throw new Error('Not implemented'); }
}

/**
 * Initialise settings panel UI: bind input elements in #pm-settings to a Settings instance,
 * wire save button, and update timer durations via timer.setDuration().
 */
export function initSettings() {
  throw new Error('Not implemented');
}
