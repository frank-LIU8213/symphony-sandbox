import { initAudio } from './audio.js';
import { initAnimations } from './animations.js';
import { fetchMarsData } from './utils.js';

export async function init() {
    console.log('Initializing Mars Site...');
    initAudio();
    initAnimations();
    try {
        const data = await fetchMarsData();
        console.log('Mars data loaded:', data);
    } catch (err) {
        console.error('Failed to load Mars data:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
