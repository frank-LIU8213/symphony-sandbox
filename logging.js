// Logging module – ownership: w_logging
(function () {
  'use strict';

  /**
   * @typedef {Object} HistoryEntry
   * @property {string} doseId
   * @property {string} medicationName
   * @property {string} takenAt
   */

  /** @type {string} */
  let _storageKey;

  // ── Internal helpers ──────────────────────────────────────────────

  /**
   * Load the history array from localStorage.
   * @returns {HistoryEntry[]}
   */
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

  /**
   * Persist the history array to localStorage.
   * @param {HistoryEntry[]} entries
   */
  function _save(entries) {
    try {
      window.localStorage.setItem(_storageKey, JSON.stringify(entries));
    } catch (e) {
      console.error('Unable to save history:', e);
    }
  }

  // ── Public API ────────────────────────────────────────────────────

  /**
   * Initialises the history store using the given localStorage key.
   * Must be called once before any logging operation.
   * @param {string} storageKey
   */
  function initLogging(storageKey) {
    _storageKey = storageKey;
    // Ensure the key exists with an empty array.
    if (!window.localStorage.getItem(_storageKey)) {
      _save([]);
    }
  }

  /**
   * Records that the dose with the given id has been taken.
   * Stores a HistoryEntry with the current timestamp.
   * No‑op if the doseId is already taken (avoids duplicates).
   *
   * @param {string} doseId - unique identifier for the dose
   * @param {string} [medicationName] - friendly name of the medication
   */
  function markDoseTaken(doseId, medicationName) {
    if (!doseId) return;

    const entries = _load();

    // Prevent duplicate entries for the same doseId.
    if (entries.some(function (e) { return e.doseId === doseId; })) {
      return;
    }

    const entry = {
      doseId: doseId,
      medicationName: medicationName || '',
      takenAt: new Date().toISOString(),
    };

    entries.push(entry);
    _save(entries);
  }

  /**
   * Returns all logged history entries, newest first.
   * @returns {HistoryEntry[]}
   */
  function getHistory() {
    const entries = _load();
    // Sort descending by takenAt (newest first)
    entries.sort(function (a, b) {
      return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
    });
    return entries;
  }

  // Expose the public API
  window.MedRemLogging = {
    initLogging: initLogging,
    markDoseTaken: markDoseTaken,
    getHistory: getHistory,
  };
})();
