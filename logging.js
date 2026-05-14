// Logging module – ownership: w_logging
(function () {
  'use strict';

  /**
   * @typedef {Object} HistoryEntry
   * @property {string} doseId
   * @property {string} medicationName
   * @property {string} takenAt
   */

  function initLogging(storageKey) {
    // TODO: implement
  }

  function markDoseTaken(doseId) {
    // TODO: implement
    throw new Error('Not implemented');
  }

  function getHistory() {
    // TODO: implement
    throw new Error('Not implemented');
  }

  window.MedRemLogging = {
    initLogging: initLogging,
    markDoseTaken: markDoseTaken,
    getHistory: getHistory
  };
})();
