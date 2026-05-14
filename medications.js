// Medications module – ownership: w_medications
(function () {
  'use strict';

  /**
   * @typedef {Object} Medication
   * @property {string} id
   * @property {string} name
   * @property {string} dosage
   * @property {Schedule} schedule
   */
  /**
   * @typedef {Object} Schedule
   * @property {string} type - 'daily' | 'weekly' | 'custom'
   * @property {string[]} times - array of 'HH:MM'
   * @property {number[]} [days] - 0=Sun..6=Sat
   */

  function initMedications(storageKey) {
    // TODO: implement
  }

  function addMedication(medication) {
    // TODO: implement
    throw new Error('Not implemented');
  }

  function getMedications() {
    // TODO: implement
    throw new Error('Not implemented');
  }

  function removeMedication(id) {
    // TODO: implement
    throw new Error('Not implemented');
  }

  window.MedRemMedications = {
    initMedications: initMedications,
    addMedication: addMedication,
    getMedications: getMedications,
    removeMedication: removeMedication
  };
})();
