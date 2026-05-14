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
    this.workDuration = workDuration;
    this.breakDuration = breakDuration;
    this.onStateChange = onStateChange || null;
    this.mode = 'work';
    this.timeRemaining = workDuration;
    this.isRunning = false;
    this.sessionCount = 0;
    this._intervalId = null;
  }

  /** Start or resume the timer. */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._dispatchState();
    this._tick(); // immediate tick for responsive UI
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  /** Pause the timer without resetting. */
  pause() {
    if (!this.isRunning) return;
    this._clearInterval();
    this.isRunning = false;
    this._dispatchState();
  }

  /** Stop the timer and reset time to current mode's full duration. */
  reset() {
    this._clearInterval();
    this.isRunning = false;
    this.timeRemaining = this._currentDuration();
    this._dispatchState();
  }

  /** Immediately switch to the next mode (work<->break) and reset time. */
  skip() {
    this._clearInterval();
    this.isRunning = false;
    this._switchMode();
    this.timeRemaining = this._currentDuration();
    this._dispatchModeChanged();
    this._dispatchState();
  }

  /** @returns {TimerState} */
  getState() {
    return {
      mode: this.mode,
      timeRemaining: this.timeRemaining,
      isRunning: this.isRunning,
      workDuration: this.workDuration,
      breakDuration: this.breakDuration,
      sessionCount: this.sessionCount,
    };
  }

  /**
   * Update a duration. If the timer is currently running in that mode it will
   * take effect for the *next* session (current time is not changed).
   * @param {'work'|'break'} mode
   * @param {number} seconds
   */
  setDuration(mode, seconds) {
    if (mode === 'work') {
      this.workDuration = seconds;
    } else if (mode === 'break') {
      this.breakDuration = seconds;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  _tick() {
    this.timeRemaining = Math.max(0, this.timeRemaining - 1);
    document.dispatchEvent(
      new CustomEvent('timer:tick', { detail: this.getState() }),
    );

    if (this.timeRemaining <= 0) {
      this._handleFinish();
    } else {
      this._dispatchState();
    }
  }

  _handleFinish() {
    this._clearInterval();
    this.isRunning = false;

    // Notify listeners that the current mode has ended.
    document.dispatchEvent(
      new CustomEvent('timer:finished', { detail: { mode: this.mode } }),
    );

    // A work session counts as completed.
    if (this.mode === 'work') {
      this.sessionCount += 1;
    }

    this._switchMode();
    this.timeRemaining = this._currentDuration();

    this._dispatchModeChanged();
    this._dispatchState();
  }

  _switchMode() {
    this.mode = this.mode === 'work' ? 'break' : 'work';
  }

  _currentDuration() {
    return this.mode === 'work' ? this.workDuration : this.breakDuration;
  }

  _dispatchState() {
    const state = this.getState();
    document.dispatchEvent(
      new CustomEvent('timer:state-changed', { detail: state }),
    );
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  _dispatchModeChanged() {
    document.dispatchEvent(
      new CustomEvent('timer:mode-changed', { detail: { mode: this.mode } }),
    );
  }

  _clearInterval() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
}
