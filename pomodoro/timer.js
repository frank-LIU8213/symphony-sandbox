/** Core timer logic for the Pomodoro app. */

/**
 * @typedef {Object} TimerState
 * @property {'work'|'break'} mode
 * @property {number} timeRemaining - seconds
 * @property {boolean} isRunning
 * @property {number} workDuration - seconds
 * @property {number} breakDuration - seconds
 * @property {number} sessionCount
 */

export default class PomodoroTimer {
  /**
   * @param {Object} config
   * @param {number} [config.workDuration=1500]
   * @param {number} [config.breakDuration=300]
   * @param {(state: TimerState) => void} [config.onStateChange]
   */
  constructor({
    workDuration = 1500,
    breakDuration = 300,
    onStateChange,
  } = {}) {
    throw new Error('Not implemented');
  }

  start() { throw new Error('Not implemented'); }
  pause() { throw new Error('Not implemented'); }
  reset() { throw new Error('Not implemented'); }
  skip() { throw new Error('Not implemented'); }

  /** @returns {TimerState} */
  getState() { throw new Error('Not implemented'); }

  /**
   * @param {'work'|'break'} mode
   * @param {number} seconds
   */
  setDuration(mode, seconds) { throw new Error('Not implemented'); }
}
