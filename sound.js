/**
 * Sound effects for the 连连看 game using Web Audio API.
 * No external audio files required — tones are synthesised on the fly.
 */

export function initSound(bus) {
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function playTone(freq, duration, type, vol) {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }

    let startPlayed = false;

    bus.on('match', () => {
        playTone(880, 0.1, 'sine', 0.3);
        setTimeout(() => playTone(1100, 0.15, 'sine', 0.25), 100);
    });

    bus.on('invalid', () => {
        playTone(200, 0.2, 'square', 0.15);
    });

    bus.on('start', () => {
        if (!startPlayed) {
            startPlayed = true;
            playTone(523, 0.3, 'sine', 0.3);
            setTimeout(() => playTone(659, 0.3, 'sine', 0.3), 200);
            setTimeout(() => playTone(784, 0.4, 'sine', 0.3), 400);
        }
    });

    bus.on('gameOver', () => {
        playTone(523, 0.5, 'sine', 0.3);
        setTimeout(() => playTone(659, 0.5, 'sine', 0.3), 100);
        setTimeout(() => playTone(784, 0.5, 'sine', 0.3), 200);
        setTimeout(() => playTone(1047, 0.8, 'sine', 0.3), 300);
    });
}
