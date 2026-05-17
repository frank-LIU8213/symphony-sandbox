/**
 * AudioEngine handles all sound effects and background audio using the Web Audio API.
 */
class AudioEngine {
    constructor(config = {}) {
        this.volume = config.volume ?? 0.5;
        this.enabled = config.enabled ?? true;
        this.ctx = null;
    }

    /**
     * Initializes the AudioContext. Must be called after a user gesture.
     */
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Plays a specific sound effect.
     * @param {string} name - The sound key from SoundEffect enum.
     */
    play(name) {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        gain.gain.value = this.volume;
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (name) {
            case 'fusion_start':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'fusion_complete':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(this.volume, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'fission_start':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'fission_complete':
                osc.type = 'square';
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                osc.start(now);
                osc.stop(now + 0.8);
                break;
            case 'correct':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.setValueAtTime(700, now + 0.1);
                osc.frequency.setValueAtTime(900, now + 0.2);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(this.volume, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'wrong':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            default:
                console.warn(`Unknown sound effect: ${name}`);
                return;
        }
    }

    /**
     * Sets the master volume.
     * @param {number} vol - 0.0 to 1.0.
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    /**
     * Toggles audio enabled state.
     * @param {boolean} enabled - Whether audio is enabled.
     */
    toggle(enabled) {
        this.enabled = enabled;
    }
}

window.AudioEngine = AudioEngine;
