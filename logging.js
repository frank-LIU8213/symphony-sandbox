(function () {
  'use strict';

  /** @type {string} */
  let _storageKey;

  // Load history array from localStorage.
  function _load() {
    try {
      const raw = window.localStorage.getItem(_storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Persist history array to localStorage.
  function _save(entries) {
    try {
      window.localStorage.setItem(_storageKey, JSON.stringify(entries));
    } catch (e) {
      console.error('Unable to save history:', e);
    }
  }

  /**
   * Initialises the history store.
   * @param {string} storageKey
   */
  function initLogging(storageKey) {
    _storageKey = storageKey;
    if (!window.localStorage.getItem(_storageKey)) {
      _save([]);
    }
  }

  /**
   * Records a taken dose.
   * @param {string} doseId
   * @param {string} [medicationName]
   */
  function markDoseTaken(doseId, medicationName) {
    if (!doseId) return;
    const entries = _load();
    if (entries.some(e => e.doseId === doseId)) return;
    const entry = {
      doseId: doseId,
      medicationName: medicationName || '',
      takenAt: new Date().toISOString(),
    };
    entries.push(entry);
    _save(entries);
  }

  /**
   * Returns history entries, optionally filtered.
   * @param {{ medicationName?: string, fromDate?: Date, toDate?: Date }} [filter]
   * @returns {Array<{doseId: string, medicationName: string, takenAt: string}>}
   */
  function getHistory(filter) {
    const entries = _load();
    if (!filter) return entries.slice();
    return entries.filter(entry => {
      if (filter.medicationName) {
        // Case‑insensitive substring match
        const query = filter.medicationName.toLowerCase();
        if (!entry.medicationName.toLowerCase().includes(query)) return false;
      }
      if (filter.fromDate || filter.toDate) {
        const taken = new Date(entry.takenAt);
        if (filter.fromDate && taken < filter.fromDate) return false;
        if (filter.toDate && taken > filter.toDate) return false;
      }
      return true;
    });
  }

  /**
   * Removes a single history entry by doseId.
   * @param {string} doseId
   */
  function removeHistoryEntry(doseId) {
    if (!doseId) return;
    const entries = _load();
    const idx = entries.findIndex(e => e.doseId === doseId);
    if (idx === -1) return;
    entries.splice(idx, 1);
    _save(entries);
  }

  /**
   * Clears all history.
   */
  function clearHistory() {
    _save([]);
  }

  /**
   * Exports history as JSON string.
   * @returns {string}
   */
  function exportHistory() {
    return JSON.stringify(_load());
  }

  window.MedRemLogging = {
    initLogging,
    markDoseTaken,
    getHistory,
    removeHistoryEntry,
    clearHistory,
    exportHistory
  };
})();
