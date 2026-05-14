/** Settings persistence and UI binding. */

const STORAGE_KEY = 'pomodoro-settings';

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
    /** @type {Object} */
    this._defaults = { ...DEFAULTS, ...defaults };
    /** @type {Array<function>} */
    this._changeListeners = [];
  }

  /** @returns {Object} current settings from localStorage (merged with defaults). */
  load() {
    let stored = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        stored = JSON.parse(raw);
      }
    } catch {
      // ignore parse errors
    }
    return { ...this._defaults, ...stored };
  }

  /** @param {Object} state */
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /** @param {string} key */
  get(key) {
    return this.load()[key];
  }

  /** @param {string} key @param {*} value */
  set(key, value) {
    const current = this.load();
    current[key] = value;
    this.save(current);
    const changed = {};
    changed[key] = value;
    this._changeListeners.forEach(cb => cb(changed));
  }

  /** @param {(changed: Object) => void} callback */
  onChange(callback) {
    this._changeListeners.push(callback);
  }
}

/**
 * Initialise settings panel UI: bind input elements in #pm-settings to a Settings instance,
 * wire save button, and update timer durations via timer.setDuration().
 */
export function initSettings() {
  const settings = new Settings();

  const workInput = document.getElementById('pm-work-duration');
  const breakInput = document.getElementById('pm-break-duration');
  const soundCheckbox = document.getElementById('pm-sound-toggle');
  const themeSelect = document.getElementById('pm-theme-select');
  const saveBtn = document.getElementById('pm-save-settings');

  if (!workInput || !breakInput || !soundCheckbox || !themeSelect || !saveBtn) {
    // DOM elements not ready – bail silently
    return;
  }

  // Populate UI from saved settings
  const saved = settings.load();
  workInput.value = Math.round(saved.workDuration / 60);
  breakInput.value = Math.round(saved.breakDuration / 60);
  soundCheckbox.checked = saved.soundEnabled;
  themeSelect.value = saved.backgroundTheme;

  saveBtn.addEventListener('click', () => {
    const workDuration = parseInt(workInput.value, 10) * 60;
    const breakDuration = parseInt(breakInput.value, 10) * 60;
    const soundEnabled = soundCheckbox.checked;
    const backgroundTheme = themeSelect.value;

    settings.set('workDuration', workDuration);
    settings.set('breakDuration', breakDuration);
    settings.set('soundEnabled', soundEnabled);
    settings.set('backgroundTheme', backgroundTheme);

    // Push duration changes to the active timer
    // The timer instance is expected to be stored on window.__pomodoroTimer by the
    // agent that creates the PomodoroTimer (w0).
    const timer = window.__pomodoroTimer;
    if (timer) {
      timer.setDuration('work', workDuration);
      timer.setDuration('break', breakDuration);
    }

    // Update background theme (handled by w4)
    import('./background.js').then(bg => {
      if (typeof bg.updateBackground === 'function') {
        bg.updateBackground(backgroundTheme);
      }
    }).catch(() => {});
  });

  // Toggle settings panel visibility (basic behaviour)
  const toggle = document.getElementById('pm-settings-toggle');
  const panel = document.getElementById('pm-settings');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.setAttribute('aria-hidden', String(expanded));
    });
  }
}
