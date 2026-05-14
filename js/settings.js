(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * @returns {Pomodoro.SettingsAPI}
   */
  Pomodoro.Settings = {
    init() {
      throw new Error('Not implemented: Settings.init');
    },
    getSettings() {
      throw new Error('Not implemented: Settings.getSettings');
    },
    setMode(mode) {
      throw new Error('Not implemented: Settings.setMode');
    },
    getCurrentMode() {
      throw new Error('Not implemented: Settings.getCurrentMode');
    },
    onModeChange(callback) {
      throw new Error('Not implemented: Settings.onModeChange');
    }
  };
})();