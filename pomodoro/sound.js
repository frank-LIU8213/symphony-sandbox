/** Sound effects synthesised via Web Audio API. */

let audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Pre-creates audio context and buffers. Must be called before first play. */
export function initSounds() {
  ensureAudioContext();
}

/** Play a short tick sound. */
export function playTick() {
  const ctx = ensureAudioContext();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/** Play the alarm sound (end of timer). */
export function playAlarm() {
  const ctx = ensureAudioContext();
  const now = ctx.currentTime;
  const totalDuration = 1.5; // seconds
  const beepCount = 6;
  const beepDuration = 0.15;
  const gap = (totalDuration - beepDuration * beepCount) / (beepCount - 1);
  for (let i = 0; i < beepCount; i++) {
    const t = now + i * (beepDuration + gap);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = (i % 2 === 0) ? 880 : 1100;
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + beepDuration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + beepDuration);
  }
}

/** Play a sound when starting or resuming the timer. */
export function playStart() {
  const ctx = ensureAudioContext();
  const now = ctx.currentTime;
  const notes = [
    { freq: 523.25, duration: 0.1 },
    { freq: 659.25, duration: 0.1 },
    { freq: 783.99, duration: 0.15 },
  ];
  let t = now;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + note.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + note.duration);
    t += note.duration;
  }
}
