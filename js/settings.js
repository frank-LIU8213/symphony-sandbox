(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  const DEFAULT_SETTINGS = {
    workDuration: 1500,        // 25 min
    shortBreakDuration: 300,   // 5 min
    longBreakDuration: 900     // 15 min
  };

  let currentMode = 'work';
  let settings = { ...DEFAULT_SETTINGS };
  let modeChangeCallbacks = [];

  Pomodoro.Settings = {
    init() {
      currentMode = 'work';
      settings = { ...DEFAULT_SETTINGS };
      // Could later load persisted settings from localStorage here
    },

    getSettings() {
      return { ...settings };
    },

    setMode(mode) {
      if (mode !== 'work' && mode !== 'shortBreak' && mode !== 'longBreak') {
        console.error(`Pomodoro.Settings.setMode: invalid mode "${mode}"`);
        return;
      }
      currentMode = mode;
      modeChangeCallbacks.forEach(cb => cb(mode));
    },

    getCurrentMode() {
      return currentMode;
    },

    onModeChange(callback) {
      modeChangeCallbacks.push(callback);
    }
  };
})();
