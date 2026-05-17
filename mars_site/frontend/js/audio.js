let audioContext = null;
const soundCache = new Map();

export function initAudio() {
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    console.log('Audio context initialized');
}

export async function playSound(soundUrl) {
    if (!audioContext) return;
    
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    try {
        let audio = soundCache.get(soundUrl);
        if (!audio) {
            audio = new Audio(soundUrl);
            soundCache.set(soundUrl, audio);
        }
        
        audio.currentTime = 0;
        await audio.play();
    } catch (err) {
        console.warn(`Failed to play sound: ${soundUrl}`, err);
    }
}

export function attachAudioTriggers() {
    console.log('Audio triggers attached');
}

export function getAudioContext() {
    return audioContext;
}
