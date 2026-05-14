(function () {
  'use strict';

  const NOTIFICATION_THRESHOLD_MS = 30000; // ±30 seconds
  const INTERVAL_MS = 30000;               // 30 seconds

  /** @type {Set<string>} */
  let notifiedIds = new Set();

  /** @type {HTMLAudioElement|null} */
  let audio = null;

  /** @type {number|null} */
  let intervalId = null;

  let _soundEnabled = true;
  let _notificationEnabled = true;

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

        // ---- Audio cue ----
        if (_soundEnabled && audio) {
          // only play if sound enabled (audio object will be managed elsewhere)
          // Existing audio logic will be preserved inside this block
          // TODO: integrate audio player based on enabled flag
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

  // -------- internal helpers (keep existing) --------
  function startPolling() {
    if (intervalId !== null) return;
    intervalId = setInterval(function () {
      // Polling will be wired by integrator; this stub just keeps interval alive.
    }, INTERVAL_MS);
  }

  function getMedicationName(medicationId) {
    // Stub: integrator will replace with real lookup.
    return '';
  }
})();
