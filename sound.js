(function () {
  'use strict';

  /** @type {AudioContext|null} */
  let audioCtx = null;

  /** @type {string} */
  let _soundType = 'beep';

  /** @type {number} */
  let _volume = 0.5;

  /** @type {boolean} */
  let _initialized = false;

  const STORAGE_KEY = 'medrem_sound_settings';

  // ---------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function loadSettings() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.type) _soundType = parsed.type;
        if (typeof parsed.volume === 'number') _volume = Math.min(1, Math.max(0, parsed.volume));
      }
    } catch (_) { /* ignore */ }
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: _soundType, volume: _volume }));
    } catch (_) { /* ignore */ }
  }

  /**
   * Play a tone using Web Audio API.
   * @param {number} freq
   * @param {number} duration - seconds
   * @param {number} volume - 0..1
   * @param {number} [startOffset] - seconds delay from now
   */
  function playTone(freq, duration, volume, startOffset) {
    const now = getAudioContext().currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const startTime = now + (startOffset || 0);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ---------------------------------------------------------------
  // Sound implementations
  // ---------------------------------------------------------------

  function playBeepSound(volume) {
    playTone(880, 0.15, volume);
  }

  function playChimeSound(volume) {
    playTone(880, 0.12, volume, 0);
    playTone(1100, 0.12, volume * 0.8, 0.08);
  }

  function playMelodySound(volume) {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      playTone(freq, 0.06, volume, i * 0.065);
    });
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------

  /**
   * Injects sound settings panel (picker + volume slider) into the
   * specified container, or appends to body if no container ID is given.
   * Preferences are loaded from localStorage.
   * @param {string} [containerId] - ID of the element to host the panel.
   */
  function initSoundSettings(containerId) {
    if (_initialized) return;
    loadSettings();

    // ----- create panel -----
    const panel = document.createElement('div');
    panel.className = 'med-sound-settings';
    panel.id = 'med-sound-panel';

    const heading = document.createElement('h3');
    heading.className = 'med-sound-settings__heading';
    heading.textContent = '声音设置';
    panel.appendChild(heading);

    // Sound type picker
    const typeRow = document.createElement('div');
    typeRow.className = 'med-sound-settings__row';

    const typeLabel = document.createElement('label');
    typeLabel.textContent = '提示音';
    typeLabel.className = 'med-sound-settings__label';
    typeLabel.setAttribute('for', 'med-sound-select');

    const typeSelect = document.createElement('select');
    typeSelect.id = 'med-sound-select';
    typeSelect.className = 'med-sound-settings__select';

    const options = [
      { value: 'beep', text: '简单提示' },
      { value: 'chime', text: '清脆铃声' },
      { value: 'melody', text: '短旋律' },
    ];
    options.forEach(opt => {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.text;
      typeSelect.appendChild(optionEl);
    });
    typeSelect.value = _soundType;

    typeRow.appendChild(typeLabel);
    typeRow.appendChild(typeSelect);
    panel.appendChild(typeRow);

    // Volume slider
    const volRow = document.createElement('div');
    volRow.className = 'med-sound-settings__row';

    const volLabel = document.createElement('label');
    volLabel.textContent = '音量';
    volLabel.className = 'med-sound-settings__label';
    volLabel.setAttribute('for', 'med-sound-volume');

    const volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.id = 'med-sound-volume';
    volSlider.className = 'med-sound-settings__slider';
    volSlider.min = 0;
    volSlider.max = 1;
    volSlider.step = 0.1;
    volSlider.value = String(_volume);

    volRow.appendChild(volLabel);
    volRow.appendChild(volSlider);
    panel.appendChild(volRow);

    // Test button
    const testBtn = document.createElement('button');
    testBtn.className = 'btn btn--small med-sound-settings__test-btn';
    testBtn.textContent = '试听';
    panel.appendChild(testBtn);

    // ----- attach to DOM -----
    let container;
    if (containerId) {
      container = document.getElementById(containerId);
    }
    if (!container) {
      container = document.body;
    }
    container.appendChild(panel);

    // ----- event listeners -----
    typeSelect.addEventListener('change', function () {
      _soundType = this.value;
      saveSettings();
    });

    volSlider.addEventListener('input', function () {
      _volume = parseFloat(this.value);
      saveSettings();
    });

    testBtn.addEventListener('click', function () {
      playSound();
    });

    _initialized = true;
  }

  /**
   * Play the selected sound (or a specific type) at the current volume.
   * @param {string} [type] - Override sound type: 'beep', 'chime', or 'melody'.
   */
  function playSound(type) {
    const sound = type || _soundType;
    const vol = _volume;

    try {
      // Ensure AudioContext is resumed (browsers require user gesture)
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      switch (sound) {
        case 'chime':
          playChimeSound(vol);
          break;
        case 'melody':
          playMelodySound(vol);
          break;
        case 'beep':
        default:
          playBeepSound(vol);
          break;
      }
    } catch (_) {
      // audio not supported – silent fallback
    }
  }

  /**
   * Set the volume level and persist to localStorage.
   * @param {number} level - value between 0 and 1.
   */
  function setVolume(level) {
    const clamped = Math.min(1, Math.max(0, level));
    _volume = clamped;
    saveSettings();
    // Update slider if it exists
    const slider = document.getElementById('med-sound-volume');
    if (slider) {
      slider.value = String(clamped);
    }
  }

  // Expose public API
  window.MedRemSound = {
    initSoundSettings,
    playSound,
    setVolume,
  };
})();
