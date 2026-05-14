// Notifications module – ownership: w_notifications
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

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  function initNotifications() {
    if (!('Notification' in window)) {
      // Notifications not supported – nothing to do
      return;
    }

    if (Notification.permission === 'granted') {
      startPolling();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
          startPolling();
        }
        // Even if denied we still start polling – audio may still play
        // and the check‑and‑notify function will skip the `new Notification()` call.
        startPolling();
      });
    } else {
      // Denied – start polling anyway (audio still possible)
      startPolling();
    }
  }

  /**
   * @param {Dose[]} doses
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

        // Look up the medication name (for a richer message)
        var medName = getMedicationName(dose.medicationId) || '用药';

        // ---- Browser notification ----
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('用药提醒', {
              body: '该服用: ' + medName
            });
          } catch (_) {
            // Silently ignore (e.g. test environment without a real browser)
          }
        }

        // ---- Audio cue ----
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(function () {
            // Autoplay may be blocked – that's okay
          });
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  function startPolling() {
    if (intervalId !== null) {
      return; // already started
    }

    // Prepare the audio element once
    try {
      audio = new Audio('notification.mp3');
    } catch (_) {
      // File may not exist yet – that's fine, we just won't play sound
    }

    // Run once immediately, then every 30 seconds
    pollUpcomingDoses();
    intervalId = setInterval(pollUpcomingDoses, INTERVAL_MS);
  }

  function pollUpcomingDoses() {
    // Guard: required modules must be present
    if (!window.MedRemMedications || !window.MedRemSchedule) {
      return;
    }

    var medications;
    try {
      medications = window.MedRemMedications.getMedications();
    } catch (_) {
      return;
    }

    if (!medications || medications.length === 0) {
      return;
    }

    var doses;
    try {
      doses = window.MedRemSchedule.getUpcomingDoses(medications);
    } catch (_) {
      return;
    }

    // Use the public property so that the main.js audio wrapper applies
    // to notifications triggered by the background timer as well.
    window.MedRemNotifications.checkAndNotify(doses);
  }

  function getMedicationName(medicationId) {
    if (!window.MedRemMedications) {
      return null;
    }
    var meds;
    try {
      meds = window.MedRemMedications.getMedications();
    } catch (_) {
      return null;
    }
    for (var i = 0; i < meds.length; i++) {
      if (meds[i].id === medicationId) {
        return meds[i].name;
      }
    }
    return null;
  }

  // ---------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------

  window.MedRemNotifications = {
    initNotifications: initNotifications,
    checkAndNotify: checkAndNotify
  };
})();
