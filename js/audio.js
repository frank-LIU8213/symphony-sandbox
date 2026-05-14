(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /** @type {import('./contract').AudioAPI} */
  Pomodoro.Audio = {
    init() {
      throw new Error('Not implemented: Audio.init');
    },
    playSound(name) {
      throw new Error('Not implemented: Audio.playSound');
    }
  };
})();