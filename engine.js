/**
 * Audio controller for managing sound effects and ambient audio.
 */
class AudioController {
    constructor() {
        this.sounds = new Map();
        this.globalVolume = 1.0;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = this.globalVolume;
    }

    /**
     * Preload and register an audio asset.
     * @param {string} name - Unique identifier for the sound.
     * @param {AudioConfig} config - Audio configuration.
     */
    register(name, config) {
        const audio = new Audio(config.url);
        audio.loop = config.loop;
        audio.volume = config.volume;
        this.sounds.set(name, audio);
    }

    /**
     * Play a registered sound.
     * @param {string} name - Sound identifier.
     * @param {number} [volume] - Optional override volume.
     */
    play(name, volume) {
        const audio = this.sounds.get(name);
        if (!audio) return;
        if (volume !== undefined) audio.volume = volume;
        audio.play().catch(e => console.warn('Audio play failed:', e));
    }

    /**
     * Stop a registered sound.
     * @param {string} name - Sound identifier.
     */
    stop(name) {
        const audio = this.sounds.get(name);
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    }

    /**
     * Set global volume for all sounds.
     * @param {number} vol - Volume between 0 and 1.
     */
    setGlobalVolume(vol) {
        this.globalVolume = vol;
        this.masterGain.gain.value = vol;
        this.sounds.forEach(audio => {
            audio.volume = vol;
        });
    }

    /**
     * Play a synthesized ambient sound for the tech theme.
     * @param {string} type - 'drone' or 'shimmer'
     * @returns {Object} - Reference to stop it later
     */
    playAmbient(type) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        filter.type = 'lowpass';
        filter.frequency.value = type === 'drone' ? 150 : 600;
        
        osc.type = type === 'drone' ? 'sine' : 'triangle';
        osc.frequency.value = type === 'drone' ? 55 : 330;
        
        gain.gain.value = 0.08;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = type === 'drone' ? 0.05 : 0.3;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = type === 'drone' ? 8 : 40;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        return { stop: () => { osc.stop(); lfo.stop(); } };
    }
}

/**
 * Animation loop manager.
 */
class AnimationLoop {
    constructor() {
        this.running = false;
        this.callback = null;
        this.lastTime = 0;
    }

    /**
     * Start the animation loop.
     * @param {(state: AnimationState) => void} callback - Function to call each frame.
     */
    start(callback) {
        if (this.running) return;
        this.running = true;
        this.callback = callback;
        this.lastTime = performance.now();
        this.tick();
    }

    stop() {
        this.running = false;
    }

    tick() {
        if (!this.running) return;
        const now = performance.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.callback({ time: now, delta });
        requestAnimationFrame(() => this.tick());
    }
}
