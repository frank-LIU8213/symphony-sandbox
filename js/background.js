(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * Background API – loads a dynamically generated image and applies it
   * to #app-background.
   *
   * The orchestrator generates the image via the prompt in
   * .symphony-image-request and places it at generated-images/background.png .
   */
  Pomodoro.Background = {
    /**
     * Fetch the background image (or fall back to a gradient) and apply it.
     * @returns {void}
     */
    setBackgroundImage: function() {
      var el = document.getElementById('app-background');
      if (!el) return;

      // Use the pre‑generated image if it exists; otherwise a gradient fallback
      var imgUrl = 'generated-images/background.png';
      var img = new Image();
      img.onload = function() {
        el.style.backgroundImage = 'url(' + imgUrl + ')';
        el.style.backgroundSize   = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat  = 'no-repeat';
      };
      img.onerror = function() {
        // Gradient fallback (already set in CSS, but keep here for resilience)
        el.style.backgroundImage =
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
      };
      img.src = imgUrl;
    }
  };
})();
