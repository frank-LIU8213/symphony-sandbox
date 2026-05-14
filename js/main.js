(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // --------------------------------------------------
    // 1. Initialise all modules
    // --------------------------------------------------
    Pomodoro.Settings.init();
    Pomodoro.Audio.init();
    var animationCtrl = Pomodoro.Animation.init('circle-progress');
    Pomodoro.Background.setBackgroundImage();

    // --------------------------------------------------
    // 2. Shared helpers
    // --------------------------------------------------
    function formatTime(seconds) {
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function getCurrentDuration(settings) {
      var mode = Pomodoro.Settings.getCurrentMode();
      if (mode === 'work') return settings.workDuration;
      if (mode === 'shortBreak') return settings.shortBreakDuration;
      return settings.longBreakDuration;
    }

    var sessionCount = 0;

    function advanceSession() {
      var mode = Pomodoro.Settings.getCurrentMode();
      if (mode === 'work') {
        sessionCount++;
        if (sessionCount % 4 === 0) {
          Pomodoro.Settings.setMode('longBreak');
        } else {
          Pomodoro.Settings.setMode('shortBreak');
        }
      } else {
        // break completed, switch back to work
        Pomodoro.Settings.setMode('work');
      }
    }

    // --------------------------------------------------
    // 3. Timer lifecycle
    // --------------------------------------------------
    var currentTimer = null;

    function setupTimer() {
      // stop any previous timer
      if (currentTimer) {
        currentTimer.reset();
      }

      var settings = Pomodoro.Settings.getSettings();
      var total = getCurrentDuration(settings);
      currentTimer = Pomodoro.createTimer(settings);
      currentTimer.duration = total;   // ensure the timer uses the correct duration for the current mode

      currentTimer.setCallbacks({
        onTick: function(remaining, totalSeconds) {
          document.getElementById('timer-display').textContent = formatTime(remaining);
          var fraction = remaining / totalSeconds;
          animationCtrl.updateProgress(fraction);
        },
        onComplete: function() {
          Pomodoro.Audio.playSound('timerEnd');
          animationCtrl.pulse();
          advanceSession();
        }
      });

      // initial display
      document.getElementById('timer-display').textContent = formatTime(total);
      animationCtrl.updateProgress(1);
    }

    setupTimer();

    // --------------------------------------------------
    // 4. Button handlers
    // --------------------------------------------------
    document.getElementById('btn-start').addEventListener('click', function() {
      var state = currentTimer.getState();
      if (state === 'idle' || state === 'paused') {
        Pomodoro.Audio.playSound('click');
        currentTimer.start();
      }
    });

    document.getElementById('btn-pause').addEventListener('click', function() {
      if (currentTimer.getState() === 'running') {
        Pomodoro.Audio.playSound('click');
        currentTimer.pause();
      }
    });

    document.getElementById('btn-reset').addEventListener('click', function() {
      Pomodoro.Audio.playSound('click');
      var settings = Pomodoro.Settings.getSettings();
      var total = getCurrentDuration(settings);
      if (currentTimer) {
        currentTimer.duration = total;
        currentTimer.reset();
      }
      document.getElementById('timer-display').textContent = formatTime(total);
      animationCtrl.updateProgress(1);
    });

    // --------------------------------------------------
    // 5. Mode selector
    // --------------------------------------------------
    var modeSelector = document.getElementById('mode-selector');

    modeSelector.addEventListener('change', function() {
      var mode = modeSelector.value;
      Pomodoro.Settings.setMode(mode);
      setupTimer();
    });

    // react to mode changes triggered by other code (e.g. auto‑switch)
    Pomodoro.Settings.onModeChange(function(mode) {
      modeSelector.value = mode;
      setupTimer();
    });

  });
})();
