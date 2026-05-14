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

  // ---------- schedule-type helpers ----------

  function parseTime(timeStr) {
    const parts = timeStr.split(':');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }

  function dailyNext(now, hour, min) {
    const candidate = new Date(now);
    candidate.setHours(hour, min, 0, 0);
    if (candidate.getTime() < now.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate;
  }

  function weeklyOrCustomDaysNext(schedule, timeStr, now) {
    const [hour, min] = parseTime(timeStr);
    const days = schedule.days;
    if (!days || !days.length) return [];
    const results = [];
    for (const d of days) {
      const dnum = Number(d);
      if (isNaN(dnum) || dnum < 0 || dnum > 6) continue;
      results.push(computeNextDate(now, dnum, hour, min));
    }
    return results;
  }

  function biweeklyNext(schedule, timeStr, now) {
    const [hour, min] = parseTime(timeStr);
    const startDate = schedule.startDate;
    if (!startDate) return null;
    const intervalWeeks = schedule.intervalValue || 2; // default 2 weeks
    const start = new Date(startDate);
    start.setHours(hour, min, 0, 0);
    let candidate = new Date(start);
    const intervalMs = intervalWeeks * 7 * 24 * 60 * 60 * 1000;
    while (candidate.getTime() < now.getTime()) {
      candidate = new Date(candidate.getTime() + intervalMs);
    }
    return candidate;
  }

  function monthlyNext(schedule, timeStr, now) {
    const [hour, min] = parseTime(timeStr);
    const startDate = schedule.startDate;
    const dayOfMonth = schedule.dayOfMonth;
    if (!startDate || typeof dayOfMonth !== 'number') return null;
    const start = new Date(startDate);
    start.setHours(hour, min, 0, 0);
    let year = start.getFullYear();
    let month = start.getMonth();
    while (true) {
      const lastDay = new Date(year, month + 1, 0).getDate();
      const d = Math.min(dayOfMonth, lastDay);
      const candidate = new Date(year, month, d, hour, min, 0, 0);
      if (candidate.getTime() >= now.getTime()) {
        return candidate;
      }
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
    }
  }

  function biannualNext(schedule, timeStr, now) {
    const [hour, min] = parseTime(timeStr);
    const startDate = schedule.startDate;
    if (!startDate) return null;
    const intervalMonths = schedule.intervalValue || 6; // default 6 months
    const start = new Date(startDate);
    start.setHours(hour, min, 0, 0);
    let candidate = new Date(start);
    while (candidate.getTime() < now.getTime()) {
      candidate.setMonth(candidate.getMonth() + intervalMonths);
    }
    return candidate;
  }

  function customIntervalNext(schedule, timeStr, now) {
    const [hour, min] = parseTime(timeStr);
    const startDate = schedule.startDate;
    if (!startDate) return null;
    const intervalValue = schedule.intervalValue || 1;
    const unit = schedule.intervalUnit || 'day';
    const start = new Date(startDate);
    start.setHours(hour, min, 0, 0);
    let candidate = new Date(start);
    while (candidate.getTime() < now.getTime()) {
      if (unit === 'day') {
        candidate.setDate(candidate.getDate() + intervalValue);
      } else if (unit === 'week') {
        candidate.setDate(candidate.getDate() + intervalValue * 7);
      } else { // month
        candidate.setMonth(candidate.getMonth() + intervalValue);
      }
    }
    return candidate;
  }

  // ---------- dose computation ----------

  /**
   * @param {import('./medications.js').Medication} med
   * @param {Date} now
   * @returns {import('./schedule.js').Dose[]}
   */
  function computeDosesForMedication(med, now) {
    const { schedule } = med;
    if (!schedule || !Array.isArray(schedule.times)) return [];

    const lookAheadMs = DEFAULT_LOOKAHEAD_HOURS * 60 * 60 * 1000;
    const doses = [];

    schedule.times.forEach(timeStr => {
      let candidates = [];

      switch (schedule.type) {
        case 'daily': {
          const [hour, min] = parseTime(timeStr);
          candidates.push(dailyNext(now, hour, min));
          break;
        }
        case 'weekly':
        case 'customDays': {
          candidates = weeklyOrCustomDaysNext(schedule, timeStr, now);
          break;
        }
        case 'biweekly': {
          const c = biweeklyNext(schedule, timeStr, now);
          if (c) candidates.push(c);
          break;
        }
        case 'monthly': {
          const c = monthlyNext(schedule, timeStr, now);
          if (c) candidates.push(c);
          break;
        }
        case 'biannual': {
          const c = biannualNext(schedule, timeStr, now);
          if (c) candidates.push(c);
          break;
        }
        case 'customInterval': {
          const c = customIntervalNext(schedule, timeStr, now);
          if (c) candidates.push(c);
          break;
        }
        default:
          // unknown type → skip
          break;
      }

      for (const candidate of candidates) {
        const diffMs = candidate.getTime() - now.getTime();
        if (diffMs < 0 || diffMs >= lookAheadMs) continue;

        const id =
          med.id + '|' +
          timeStr + '|' +
          schedule.type + '|' +
          candidate.toISOString();

        doses.push({
          id: id,
          medicationId: med.id,
          scheduledTime: candidate,
          taken: false,
        });
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
    return allDoses.sort((a, b) => a.scheduledTime - b.scheduledTime);
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
