(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  const PULSE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
  const CHECK_INTERVAL_MS = 5000;             // every 5 seconds

  /** @type {boolean} */
  let _enableFadeIn = true;

  /** @type {boolean} */
  let _enablePulse = true;

  /** @type {number|null} */
  let _pulseCheckTimer = null;

  /** @type {MutationObserver|null} */
  let _observer = null;

  /**
   * Add pulse class to the .dose-card that corresponds to a dose id.
   * @param {string} doseId
   */
  function _setPulseOnElement(doseId) {
    const btn = document.querySelector(`[data-dose-id="${doseId}"]`);
    if (!btn) return;
    const card = btn.closest('.dose-card');
    if (card && !card.classList.contains('med-anim-pulse')) {
      card.classList.add('med-anim-pulse');
    }
  }

  /**
   * Remove pulse class from a specific dose card.
   * @param {string} doseId
   */
  function _clearPulseFromElement(doseId) {
    const btn = document.querySelector(`[data-dose-id="${doseId}"]`);
    if (btn) {
      const card = btn.closest('.dose-card');
      if (card) card.classList.remove('med-anim-pulse');
    }
  }

  /**
   * Scan upcoming doses and apply / remove pulse classes accordingly.
   */
  function _updatePulseStates() {
    try {
      const meds =
        window.MedRemMedications &&
        typeof window.MedRemMedications.getMedications === 'function'
          ? window.MedRemMedications.getMedications()
          : [];
      const doses =
        window.MedRemSchedule &&
        typeof window.MedRemSchedule.getUpcomingDoses === 'function'
          ? window.MedRemSchedule.getUpcomingDoses(meds)
          : [];

      const now = Date.now();
      doses.forEach(function (dose) {
        const diff = dose.scheduledTime.getTime() - now;
        if (diff >= 0 && diff <= PULSE_THRESHOLD_MS) {
          _setPulseOnElement(dose.id);
        } else {
          _clearPulseFromElement(dose.id);
        }
      });
    } catch (_) {
      // Silently ignore – modules may not have been loaded yet
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Initializes animation hooks.
   *
   * Attaches a MutationObserver that auto-applies fade‑in to every `.card`
   * element when it first appears in the DOM (if `options.enableFadeIn` is true).
   * Also starts a periodic timer that adds / removes a pulse animation on
   * upcoming dose cards (if `options.enablePulse` is true).
   *
   * Safe to call multiple times; subsequent calls update the active flags but do
   * not create duplicate observers or timers.
   *
   * @param {{ enableFadeIn?: boolean, enablePulse?: boolean }} [options]
   */
  function initAnimations(options) {
    if (options) {
      if (typeof options.enableFadeIn === 'boolean') {
        _enableFadeIn = options.enableFadeIn;
      }
      if (typeof options.enablePulse === 'boolean') {
        _enablePulse = options.enablePulse;
      }
    }

    // ----- fade‑in observer -----
    if (_enableFadeIn && !_observer) {
      _observer = new MutationObserver(function () {
        document.querySelectorAll('.card').forEach(function (s) {
          if (!s.classList.contains('med-anim-fade-in')) {
            fadeInSection(s);
          }
        });
      });
      _observer.observe(document.body, { childList: true, subtree: true });
    }

    // ----- periodic pulse timer -----
    if (_enablePulse && _pulseCheckTimer === null) {
      _pulseCheckTimer = setInterval(_updatePulseStates, CHECK_INTERVAL_MS);
      // Run immediately so pulses are visible as soon as possible
      _updatePulseStates();
    }
  }

  /**
   * Apply a pulsing animation to a specific dose card.
   * @param {HTMLElement} element - The `.dose-card` element to pulse.
   */
  function pulseDoseItem(element) {
    if (!element) return;
    element.classList.add('med-anim-pulse');
  }

  /**
   * Animate a dose card when the user marks it taken.
   *
   * Applies a scale‑down + fade‑out transition.  When the animation finishes
   * the `callback` is invoked (if supplied) and the animation class is cleaned up.
   *
   * @param {HTMLElement} element - The `.dose-card` element.
   * @param {() => void} [callback] - Called when the animation ends.
   */
  function animateDoseTaken(element, callback) {
    if (!element) {
      if (callback) callback();
      return;
    }

    function onEnd() {
      element.removeEventListener('animationend', onEnd);
      if (callback) callback();
    }

    element.classList.add('med-anim-taken');
    element.addEventListener('animationend', onEnd);
  }

  /**
   * Fade‑in a container element (typically a whole section card).
   * @param {HTMLElement} container
   */
  function fadeInSection(container) {
    if (!container) return;
    container.classList.add('med-anim-fade-in');
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  window.MedRemAnimations = {
    initAnimations,
    pulseDoseItem,
    animateDoseTaken,
    fadeInSection
  };
})();
