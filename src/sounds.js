let audioCtx = null;

/**
 * Initializes the Web Audio API context. Must be called on user gesture.
 * @returns {Promise<void>}
 */
export async function initSounds() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.resume();
  console.log('[Sounds] AudioContext initialized');
}

/**
 * Plays a procedural sci-fi sound effect.
 * @param {'click' | 'whoosh' | 'hum' | 'alarm'} type 
 * @returns {void}
 */
export function playSound(type) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  switch (type) {
    case 'click': {
      // Crisp futuristic UI click: short high chirp with exponential decay
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      break;
    }
    case 'whoosh': {
      // Sweeping bandpass noise for particle/light trail effects
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(3000, now + 0.3);
      filter.Q.value = 2;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.4);
      break;
    }
    case 'hum': {
      // Deep sci-fi ambient hum: dual detuned oscillators for beating effect
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      osc2.frequency.setValueAtTime(56.5, now); // slight detune for beating

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.2);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
      break;
    }
    case 'alarm': {
      // Pulsing sci-fi alert: square wave with rapid pitch modulation
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';

      // Rapid frequency modulation for urgency
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(440, now + 0.16);
      osc.frequency.setValueAtTime(880, now + 0.24);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0, now + 0.04);
      gain.gain.setValueAtTime(0.15, now + 0.08);
      gain.gain.setValueAtTime(0, now + 0.12);
      gain.gain.setValueAtTime(0.15, now + 0.16);
      gain.gain.setValueAtTime(0, now + 0.20);
      gain.gain.setValueAtTime(0.15, now + 0.24);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
  }
}
