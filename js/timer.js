(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * @param {import('./contract').TimerSettings} settings
   * @returns {import('./contract').TimerInstance}
   */
  Pomodoro.createTimer = function(settings) {
    throw new Error('Not implemented: createTimer');
  };
})();