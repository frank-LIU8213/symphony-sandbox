(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /** @type {import('./contract').BackgroundAPI} */
  Pomodoro.Background = {
    setBackgroundImage() {
      throw new Error('Not implemented: Background.setBackgroundImage');
    }
  };
})();