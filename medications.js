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

  let storageKey = null;

  /** Load medications from localStorage */
  function _load() {
    if (!storageKey) return [];
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('MedRemMedications: failed to parse stored data', e);
      return [];
    }
  }

  /** Save medications to localStorage */
  function _save(medications) {
    if (!storageKey) throw new Error('MedRemMedications: not initialized. Call initMedications first.');
    window.localStorage.setItem(storageKey, JSON.stringify(medications));
  }

  /**
   * @param {string} key
   */
  function initMedications(key) {
    storageKey = key;
  }

  /**
   * @param {Medication} medication
   * @returns {Medication}
   */
  function addMedication(medication) {
    const meds = _load();
    const med = { ...medication };
    if (!med.id) {
      med.id = crypto.randomUUID();
    }
    meds.push(med);
    _save(meds);
    return med;
  }

  /**
   * @returns {Medication[]}
   */
  function getMedications() {
    return _load();
  }

  /**
   * @param {string} id
   */
  function removeMedication(id) {
    const meds = _load();
    const idx = meds.findIndex(m => m.id === id);
    if (idx === -1) return;
    meds.splice(idx, 1);
    _save(meds);
  }

  window.MedRemMedications = {
    initMedications: initMedications,
    addMedication: addMedication,
    getMedications: getMedications,
    removeMedication: removeMedication
  };
})();
