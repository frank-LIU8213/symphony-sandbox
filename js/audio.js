(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /** @type {import('./contract').AudioAPI} */
  Pomodoro.Audio = {
    _sounds: {},

    init() {
      // Preload audio files
      this._sounds['timerEnd'] = new Audio('sounds/end.mp3');
      this._sounds['click']    = new Audio('sounds/click.mp3');

      // Mark preload – most browsers support it by default
      Object.values(this._sounds).forEach(audio => audio.preload = 'auto');
    },

    playSound(name) {
      const audio = this._sounds[name];
      if (!audio) {
        console.warn(`[Pomodoro.Audio] Unknown sound: "${name}"`);
        return;
      }
      // Reset to beginning in case it's already playing
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Browsers may block autoplay – silent failure is acceptable here
        console.warn(`[Pomodoro.Audio] Could not play "${name}":`, err.message);
      });
    }
  };
})();
