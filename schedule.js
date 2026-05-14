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

  /**
   * @param {Medication[]} medications
   * @returns {Dose[]}
   */
  function getUpcomingDoses(medications) {
    // TODO: implement
    throw new Error('Not implemented');
  }

  window.MedRemSchedule = {
    getUpcomingDoses: getUpcomingDoses
  };
})();
