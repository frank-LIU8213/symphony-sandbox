(function () {
  'use strict';

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
   * Compute the next dose date for a given schedule type starting from `now`.
   * @param {import('./medications.js').Schedule} schedule
   * @param {Date} now
   * @returns {Date|null}
   */
  function computeNextDoseForSchedule(schedule, now) {
    // TODO: implement for all schedule types
    // This function will be implemented by the schedule-task worker.
    throw new Error('computeNextDoseForSchedule not implemented yet');
  }

  /**
   * Generate upcoming doses for a single medication within the lookahead window.
   * @param {import('./medications.js').Medication} med
   * @param {Date} now
   * @returns {import('./schedule.js').Dose[]}
   */
  function computeDosesForMedication(med, now) {
    const { schedule } = med;
    if (!schedule.times) return [];
    const lookAheadMs = DEFAULT_LOOKAHEAD_HOURS * 60 * 60 * 1000;
    const doses = [];

    schedule.times.forEach(timeStr => {
      const nextDate = computeNextDoseForSchedule(schedule, now);
      if (nextDate) {
        const diffMs = nextDate.getTime() - now.getTime();
        if (diffMs >= 0 && diffMs < lookAheadMs) {
          const stableId = med.id + '|' + timeStr + '|' + (schedule.type);// TODO: improve id for custom intervals
          doses.push({
            id: stableId,
            medicationId: med.id,
            scheduledTime: nextDate,
            taken: false,
          });
        }
      }
    });

    return doses;
  }

  /**
   * @param {import('./medications.js').Medication[]} medications
   * @returns {import('./schedule.js').Dose[]}
   */
  function getUpcomingDoses(medications) {
    const now = new Date();
    const allDoses = [];
    medications.forEach(med => {
      const doses = computeDosesForMedication(med, now);
      allDoses.push(...doses);
    });
    return allDoses.sort((a,b) => a.scheduledTime - b.scheduledTime);
  }

  const SCHEDULE_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    BIANNUAL: 'biannual',
    CUSTOM_DAYS: 'customDays',
    CUSTOM_INTERVAL: 'customInterval'
  };

  window.MedRemSchedule = {
    getUpcomingDoses,
    SCHEDULE_TYPES
  };
})();
