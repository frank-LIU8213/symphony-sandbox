(function() {
  'use strict';
  window.Pomodoro = window.Pomodoro || {};

  /**
   * @param {import('./contract').TimerSettings} settings
   * @returns {import('./contract').TimerInstance}
   */
  Pomodoro.createTimer = function(settings) {
    // --- private state ---
    var duration = settings.workDuration;       // seconds per current mode (may be changed later)
    var remaining = duration;
    var state = 'idle';                         // idle | running | paused
    var intervalId = null;
    var onTickCb = null;
    var onCompleteCb = null;

    // --- internal helpers ---
    function clearTimer() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function tick() {
      if (remaining <= 0) {
        clearTimer();
        state = 'idle';
        if (onCompleteCb) onCompleteCb();
        if (onTickCb) onTickCb(0, duration);
        return;
      }
      remaining--;
      if (onTickCb) onTickCb(remaining, duration);
    }

    // --- public API ---
    function start() {
      if (state === 'running') return;          // already running – nothing to do
      if (state === 'idle') {
        remaining = duration;                   // reset to full duration
      }
      state = 'running';
      intervalId = setInterval(tick, 1000);
    }

    function pause() {
      if (state !== 'running') return;
      clearTimer();
      state = 'paused';
    }

    function reset() {
      clearTimer();
      state = 'idle';
      remaining = duration;
      if (onTickCb) onTickCb(remaining, duration);
    }

    function getRemainingTime() {
      return remaining;
    }

    function getState() {
      return state;
    }

    /**
     * @param {import('./contract').TimerCallbacks} cbs
     */
    function setCallbacks(cbs) {
      cbs = cbs || {};
      onTickCb = cbs.onTick || null;
      onCompleteCb = cbs.onComplete || null;
    }

    // --- return the contract object ---
    var timer = {
      start: start,
      pause: pause,
      reset: reset,
      getRemainingTime: getRemainingTime,
      getState: getState,
      setCallbacks: setCallbacks,
      // Not part of the public contract, but allows the integrator to change
      // the duration for the current session mode before calling start().
      get duration() { return duration; },
      set duration(val) { duration = val; }
    };

    return timer;
  };
})();
