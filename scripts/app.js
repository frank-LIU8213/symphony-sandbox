/**
 * Main timer logic for the Pomodoro clock.
 * Depends on: index.html (w0), styles/style.css (w1), sound.js (w3).
 *
 * Assumes the following DOM elements exist (created by w0):
 *   - #timer-display          (e.g. <span id="timer-display">25:00</span>)
 *   - #timer-toggle           (button to start/pause)
 *   - #timer-reset            (button to reset)
 *   - #session-label          (shows "Work" or "Break")
 *   - #cycle-count            (shows number of completed pomodori)
 *   - #progress-ring circle   (SVG <circle> whose stroke-dashoffset we animate)
 *
 * Depends on sound.js exposing:
 *   - soundManager.playStart()
 *   - soundManager.playTick()
 *   - soundManager.playComplete()
 */

(function () {
  'use strict';

  // ----------------------------- Configuration -----------------------------
  const WORK_DURATION = 25 * 60;   // seconds
  const BREAK_DURATION = 5 * 60;   // seconds
  const TICK_INTERVAL = 1000;      // ms

  // ----------------------------- State ------------------------------------
  let mode = 'work';               // 'work' | 'break'
  let timeLeft = WORK_DURATION;    // seconds remaining
  let isRunning = false;
  let isPaused = false;
  let cycles = 0;                  // completed work cycles
  let intervalId = null;

  // ----------------------------- DOM references ----------------------------
  const displayEl = document.getElementById('timer-display');
  const toggleBtn = document.getElementById('timer-toggle');
  const resetBtn = document.getElementById('timer-reset');
  const sessionLabel = document.getElementById('session-label');
  const cycleCount = document.getElementById('cycle-count');
  const progressCircle = document.querySelector('#progress-ring circle');

  // ----------------------------- Sound helpers -----------------------------
  function safePlay(name) {
    if (window.soundManager && typeof window.soundManager[name] === 'function') {
      window.soundManager[name]();
    }
  }

  // ----------------------------- UI update functions -----------------------
  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    displayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateSessionLabel() {
    sessionLabel.textContent = mode === 'work' ? 'Work' : 'Break';
  }

  function updateCycleCount() {
    cycleCount.textContent = String(cycles);
  }

  function updateProgressRing() {
    if (!progressCircle) return;
    const total = mode === 'work' ? WORK_DURATION : BREAK_DURATION;
    const circumference = progressCircle.getTotalLength ? progressCircle.getTotalLength() : 2 * Math.PI * parseFloat(progressCircle.getAttribute('r'));
    const offset = circumference * (1 - timeLeft / total);
    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
  }

  function refreshUI() {
    updateDisplay();
    updateSessionLabel();
    updateCycleCount();
    updateProgressRing();
    // Update toggle button text
    if (toggleBtn) {
      toggleBtn.textContent = isRunning && !isPaused ? 'Pause' : 'Start';
    }
  }

  // ----------------------------- Timer logic -------------------------------
  function tick() {
    if (isPaused) return;
    if (!isRunning) {
      stopTimer();
      return;
    }

    timeLeft--;
    refreshUI();

    // Tick sound (optional)
    safePlay('playTick');

    if (timeLeft <= 0) {
      // Timer finished
      safePlay('playComplete');
      if (mode === 'work') {
        // Switch to break
        mode = 'break';
        timeLeft = BREAK_DURATION;
        cycles++;
        updateCycleCount();
        updateSessionLabel();
      } else {
        // Break finished -> back to work
        mode = 'work';
        timeLeft = WORK_DURATION;
        updateSessionLabel();
      }
      refreshUI();
      // Automatically restart if still running
      if (isRunning) {
        startTimer();
      }
    }
  }

  function startTimer() {
    stopTimer();
    isRunning = true;
    isPaused = false;
    intervalId = setInterval(tick, TICK_INTERVAL);
    refreshUI();
    safePlay('playStart');
  }

  function pauseTimer() {
    isPaused = true;
    refreshUI();
    // Note: interval keeps running but tick() will skip when isPaused is true.
  }

  function resumeTimer() {
    isPaused = false;
    refreshUI();
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resetTimer() {
    stopTimer();
    mode = 'work';
    timeLeft = WORK_DURATION;
    isRunning = false;
    isPaused = false;
    // Optionally reset cycles:
    cycles = 0;
    refreshUI();
  }

  // ----------------------------- Event handlers ----------------------------
  function handleToggle() {
    if (!isRunning) {
      startTimer();
    } else if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  }

  function handleReset() {
    resetTimer();
  }

  // ----------------------------- Initialisation ----------------------------
  function init() {
    refreshUI();
    if (toggleBtn) {
      toggleBtn.addEventListener('click', handleToggle);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', handleReset);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
