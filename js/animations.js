(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * Initialise the circular progress animation.
   * @param {string} containerId - ignored; uses fixed DOM IDs from the contract.
   * @returns {import('./contract').AnimationController}
   */
  Pomodoro.Animation.init = function(containerId) {
    var circle = document.getElementById('circle-progress-fill');
    if (!circle) {
      throw new Error('Element #circle-progress-fill not found');
    }

    var r = circle.r.baseVal.value;          // radius of the circle
    var circumference = 2 * Math.PI * r;     // ≈ 282.74

    circle.style.strokeDasharray  = String(circumference);
    circle.style.strokeDashoffset = '0';     // start fully filled

    return {
      /**
       * Update the progress ring.
       * @param {number} fraction - 0 (empty) … 1 (full)
       */
      updateProgress: function(fraction) {
        var offset = circumference * (1 - fraction);
        circle.style.strokeDashoffset = String(offset);
      },

      /**
       * Trigger a brief pulse animation on the ring.
       */
      pulse: function() {
        circle.classList.remove('pomodoro__circle--pulse');
        // force reflow so the animation restarts
        void circle.offsetWidth;
        circle.classList.add('pomodoro__circle--pulse');
        setTimeout(function() {
          circle.classList.remove('pomodoro__circle--pulse');
        }, 600);
      }
    };
  };
})();
