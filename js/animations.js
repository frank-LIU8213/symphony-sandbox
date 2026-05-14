(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * @param {string} containerId
   * @returns {import('./contract').AnimationController}
   */
  Pomodoro.Animation = {
    init(containerId) {
      throw new Error('Not implemented: Animation.init');
    }
  };
})();