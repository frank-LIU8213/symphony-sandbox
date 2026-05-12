function createEffects() {
  let audioCtx = null;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine') {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* no audio */ }
  }

  function playSwap() {
    playTone(600, 0.08, 'triangle');
    setTimeout(() => playTone(800, 0.08, 'triangle'), 60);
  }

  function playMatch() {
    playTone(880, 0.15, 'square');
  }

  function playReward() {
    playTone(1200, 0.12, 'triangle');
    setTimeout(() => playTone(1600, 0.12, 'triangle'), 80);
  }

  function playInvalid() {
    playTone(200, 0.15, 'sawtooth');
  }

  function burst() {
    // visual burst is handled by app.js
  }

  return { playSwap, playMatch, playReward, playInvalid, burst };
}

export { createEffects };
