/**
 * Sound manager for the Pomodoro timer.
 * Uses the Web Audio API to generate synthesized sound effects.
 * No external audio files required.
 */

export class SoundManager {
  constructor() {
    // AudioContext is created lazily on first user interaction
    this._ctx = null;
  }

  /**
   * Initialize the AudioContext (must be called from a user gesture).
   */
  _ensureContext() {
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        console.warn('Web Audio API not supported');
        return null;
      }
      this._ctx = new AC();
    }
    // Resume if suspended (browsers suspend context until user gesture)
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  }

  /**
   * Play a short sound with given parameters.
   * @param {number} freq         Frequency in Hz
   * @param {number} duration     Duration in seconds
   * @param {string} type         OscillatorNode type (e.g. 'sine', 'triangle')
   * @param {number} startTime    Start time relative to context currentTime (0 = now)
   * @param {number} [volume=0.3] Gain level (0-1)
   */
  _playTone(freq, duration, type = 'sine', startTime = 0, volume = 0.3) {
    const ctx = this._ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
    // Fade out to avoid click
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  /**
   * Play a sequence of tones (used for completion).
   */
  _playSequence(tones) {
    tones.forEach(({ freq, duration, delay }) => {
      this._playTone(freq, duration, 'triangle', delay, 0.25);
    });
  }

  /* ---- Public API ---- */

  /**
   * Timer start sound – a short rising tone.
   */
  playStart() {
    this._playTone(440, 0.12, 'sine', 0, 0.3);
    this._playTone(660, 0.12, 'sine', 0.08, 0.25);
  }

  /**
   * Tick sound – a soft click.
   */
  playTick() {
    this._playTone(1000, 0.03, 'square', 0, 0.08);
  }

  /**
   * Timer completion sound – a three-note ascending chime.
   */
  playComplete() {
    this._playSequence([
      { freq: 523, duration: 0.2, delay: 0 },
      { freq: 659, duration: 0.2, delay: 0.18 },
      { freq: 784, duration: 0.35, delay: 0.36 },
    ]);
  }
}

// Singleton instance for easy consumption
export const sound = new SoundManager();
