import { playSound } from './audio.js';

let soundManifest = [];
let ambientLoop = null;

export function setAudioContext(ctx) {
    // kept for compatibility with other agents
}

export async function loadSoundManifest(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load sound manifest: ${res.status}`);
        const json = await res.json();
        if (json.status === 'ok' && Array.isArray(json.data)) {
            soundManifest = json.data;
            console.log(`Loaded ${soundManifest.length} sound triggers`);
            return soundManifest;
        }
        throw new Error('Invalid sound manifest format');
    } catch (err) {
        console.error('Error loading sound manifest:', err);
        return [];
    }
}

export function registerSoundTrigger(eventId, soundUrl) {
    if (!window.__marsSoundTriggers) {
        window.__marsSoundTriggers = {};
    }
    window.__marsSoundTriggers[eventId] = soundUrl;
    console.log(`Registered trigger ${eventId} -> ${soundUrl}`);
}

export function bindTriggersToElements() {
    if (!window.__marsSoundTriggers) return;
    
    Object.entries(window.__marsSoundTriggers).forEach(([eventId, soundUrl]) => {
        const el = document.querySelector(`[data-sound="${eventId}"]`);
        if (!el) return;
        
        el.addEventListener('mouseenter', () => playSound(soundUrl));
        el.addEventListener('click', () => playSound(soundUrl));
    });
    
    soundManifest.forEach(trigger => {
        const el = document.querySelector(`[data-sound="${trigger.id}"]`);
        if (!el) return;
        
        if (trigger.event === 'hover') {
            el.addEventListener('mouseenter', () => playSound(trigger.url));
        } else if (trigger.event === 'click') {
            el.addEventListener('click', () => playSound(trigger.url));
        } else if (trigger.event === 'scroll') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playSound(trigger.url);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(el);
        } else if (trigger.event === 'load') {
            playSound(trigger.url);
        }
    });
}

export function playAmbientLoop(loopId) {
    stopAmbientLoop();
    
    const trigger = soundManifest.find(t => t.id === loopId);
    if (!trigger) return;
    
    const audio = new Audio(trigger.url);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(e => console.warn('Ambient loop autoplay blocked:', e));
    ambientLoop = audio;
    console.log(`Playing ambient loop: ${loopId}`);
}

export function stopAmbientLoop() {
    if (ambientLoop) {
        ambientLoop.pause();
        ambientLoop = null;
    }
}
