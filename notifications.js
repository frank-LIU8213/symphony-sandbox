(function () {
  'use strict';

  const NOTIFICATION_THRESHOLD_MS = 30000; // ±30 seconds
  const INTERVAL_MS = 30000;               // 30 seconds

  /** @type {Set<string>} */
  let notifiedIds = new Set();

  /** @type {AudioContext|null} */
  let audioCtx = null;

  /** @type {number|null} */
  let intervalId = null;

  let _soundEnabled = true;
  let _notificationEnabled = true;

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /**
   * Plays a short sine beep through the Web Audio API.
   * @param {number} [freq=880]
   * @param {number} [duration=0.15]
   * @param {number} [volume=0.3]
   */
  function playBeep(freq, duration, volume) {
    if (freq === undefined) freq = 880;
    if (duration === undefined) duration = 0.15;
    if (volume === undefined) volume = 0.3;
    try {
      const ctx = ensureAudioCtx();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {
      // silently ignore – audio not supported
    }
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  /**
   * @param {Object} [settings]
   * @param {boolean} [settings.enableSound]
   * @param {boolean} [settings.enableNotification]
   */
  function initNotifications(settings) {
    if (settings) {
      if (typeof settings.enableSound === 'boolean') _soundEnabled = settings.enableSound;
      if (typeof settings.enableNotification === 'boolean') _notificationEnabled = settings.enableNotification;
    }

    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      startPolling();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          startPolling();
        }
        startPolling();
      });
    } else {
      startPolling();
    }
  }

  /**
   * @param {import('./schedule.js').Dose[]} doses
   */
  function checkAndNotify(doses) {
    var now = Date.now();

    for (var i = 0; i < doses.length; i++) {
      var dose = doses[i];

      // Skip already‑notified doses
      if (notifiedIds.has(dose.id)) {
        continue;
      }

      var doseTime = dose.scheduledTime.getTime();
      var diffMs = doseTime - now;

      if (Math.abs(diffMs) <= NOTIFICATION_THRESHOLD_MS) {
        // Remember that we notified for this dose
        notifiedIds.add(dose.id);

        var medName = getMedicationName(dose.medicationId) || '用药';

        // ---- Browser notification ----
        if (_notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('用药提醒', {
              body: '该服用: ' + medName
            });
          } catch (_) {
            // Silently ignore
          }
        }

        // ---- Audio cue (only when the dose is actually due) ----
        if (_soundEnabled) {
          playBeep();
        }
      }
    }
  }

  /** @param {boolean} enabled */
  function setSoundEnabled(enabled) {
    _soundEnabled = enabled;
  }

  /** @param {boolean} enabled */
  function setNotificationEnabled(enabled) {
    _notificationEnabled = enabled;
  }

  /** @param {string} doseId */
  function acknowledgeDose(doseId) {
    notifiedIds.add(doseId);
  }

  window.MedRemNotifications = {
    initNotifications,
    checkAndNotify,
    setSoundEnabled,
    setNotificationEnabled,
    acknowledgeDose
  };

  // -------- internal helpers --------

  function startPolling() {
    if (intervalId !== null) return;
    intervalId = setInterval(function () {
      try {
        // If schedule and medications modules are available, fetch doses automatically.
        var meds = window.MedRemMedications && typeof window.MedRemMedications.getMedications === 'function'
          ? window.MedRemMedications.getMedications()
          : [];
        var doses = window.MedRemSchedule && typeof window.MedRemSchedule.getUpcomingDoses === 'function'
          ? window.MedRemSchedule.getUpcomingDoses(meds)
          : [];
        checkAndNotify(doses);
      } catch (_) {
        // Silently ignore – modules may not be ready yet
      }
    }, INTERVAL_MS);
  }

  function getMedicationName(medicationId) {
    // Stub: integrator will replace with real lookup.
    return '';
  }
})();
