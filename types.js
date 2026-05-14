/** Shared type definitions (JSDoc). No runtime value. */
(function () {
  'use strict';

  /**
   * @typedef {Object} Medication
   * @property {string} id
   * @property {string} name
   * @property {string} dosage
   * @property {import('./schedule').Schedule} schedule
   */

  /**
   * @typedef {Object} Schedule
   * @property {string} type - 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
   * @property {string[]} times - array of 'HH:MM'
   * @property {number[]} [days] - 0=Sun..6=Sat
   * @property {string} [startDate] - ISO date string
   * @property {number} [intervalValue] - weeks between doses
   * @property {number} [dayOfMonth] - day of month
   */

  /**
   * @typedef {Object} Dose
   * @property {string} id
   * @property {string} medicationId
   * @property {string} medicationName
   * @property {string} dosage
   * @property {Date} dueDate
   * @property {string} time - 'HH:MM'
   */

  /**
   * @typedef {Object} HistoryEntry
   * @property {string} doseId
   * @property {string} medicationName
   * @property {string} takenAt - ISO string
   */

  window.MedRemTypes = {}; // dummy, just for reference
})();
