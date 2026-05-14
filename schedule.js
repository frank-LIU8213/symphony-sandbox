// Schedule module – ownership: w_schedule
(function () {
  'use strict';

  /**
   * @typedef {Object} Dose
   * @property {string} id
   * @property {string} medicationId
   * @property {Date} scheduledTime
   * @property {boolean} taken
   * @property {string} [takenAt]
   */

  const DEFAULT_LOOKAHEAD_HOURS = 24;

  /**
   * Compute the next Calendar Date (in local time) that falls on `targetDay`
   * at `hour:min` and is strictly >= `now`.
   * Returns a `Date` object.
   */
  function computeNextDate(now, targetDay, hour, min) {
    const currentDay = now.getDay();
    const todayAtTime = new Date(now);
    todayAtTime.setHours(hour, min, 0, 0);

    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) daysUntil += 7;

    // Same day but time has already passed → next week
    if (daysUntil === 0 && todayAtTime.getTime() < now.getTime()) {
      daysUntil = 7;
    }

    const result = new Date(now);
    result.setDate(result.getDate() + daysUntil);
    result.setHours(hour, min, 0, 0);
    return result;
  }

  /**
   * @param {Medication[]} medications
   * @returns {Dose[]}
   */
  function getUpcomingDoses(medications) {
    const now = new Date();
    const lookAheadMs = DEFAULT_LOOKAHEAD_HOURS * 60 * 60 * 1000;
    const doses = [];

    medications.forEach(med => {
      const { schedule } = med;
      const times = schedule.times || [];

      let dayIndices;
      if (schedule.type === 'daily') {
        dayIndices = [0, 1, 2, 3, 4, 5, 6];
      } else {
        // 'weekly' or 'custom' – use the days array
        dayIndices = schedule.days || [];
      }

      times.forEach(timeStr => {
        const [hourStr, minStr] = timeStr.split(':');
        const hour = parseInt(hourStr, 10);
        const min = parseInt(minStr, 10);

        dayIndices.forEach(dayTarget => {
          const scheduledDate = computeNextDate(now, dayTarget, hour, min);
          const diffMs = scheduledDate.getTime() - now.getTime();

          if (diffMs >= 0 && diffMs < lookAheadMs) {
            doses.push({
              id: crypto.randomUUID(),
              medicationId: med.id,
              scheduledTime: scheduledDate,
              taken: false,
            });
          }
        });
      });
    });

    doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    return doses;
  }

  window.MedRemSchedule = {
    getUpcomingDoses: getUpcomingDoses,
  };
})();
