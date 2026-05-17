let audioContext = null;

export function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Audio context initialized');
}

export function playSound(eventId) {
    if (!audioContext) return;
    console.log(`Playing sound: ${eventId}`);
}

export function attachAudioTriggers() {
    console.log('Audio triggers attached');
}
