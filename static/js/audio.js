/**
 * AudioEngine handles all sound effects and background audio.
 */
class AudioEngine {
    constructor() {
        this.volume = 0.5;
        this.enabled = true;
        this.sounds = {};
    }

    /**
     * Plays a specific sound effect.
     * @param {string} name - The sound key.
     */
    play(name) {
        if (!this.enabled) return;
        console.log(`Playing sound: ${name}`);
    }

    /**
     * Sets the master volume.
     * @param {number} vol - 0.0 to 1.0.
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    /**
     * Initializes audio context and loads assets.
     */
    init() {
        console.log('AudioEngine initialized');
    }
}

window.AudioEngine = AudioEngine;