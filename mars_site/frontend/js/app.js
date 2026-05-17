import { initAudio, attachAudioTriggers } from './audio.js';
import { initAnimations, setupScrollAnimations, triggerAnimation } from './animations.js';
import { initSvgEngine, renderSvgPath, animateSvgRotation } from './svg_engine.js';
import { loadSoundManifest, registerSoundTrigger, playAmbientLoop, bindTriggersToElements } from './sound_manager.js';
import { fetchMarsData, fetchSounds, debounce } from './utils.js';
import { createFactCard, bindDataToElements } from './components.js';

/**
 * Main initialization routine for the Mars Interactive Experience.
 * Orchestrates data fetching, UI rendering, audio, and animations.
 */
export async function init() {
    console.log('Initializing Mars Site...');
    
    try {
        // 1. Initialize core systems
        initAudio();
        initSvgEngine();
        initAnimations();
        
        // 2. Fetch data in parallel
        const [marsResponse, soundsResponse] = await Promise.all([
            fetchMarsData(),
            fetchSounds()
        ]);
        
        console.log('Mars data loaded:', marsResponse);
        console.log('Sounds data loaded:', soundsResponse);
        
        // 3. Setup sound system
        if (soundsResponse?.data?.length) {
            await loadSoundManifest('/api/mars/sounds');
            soundsResponse.data.forEach(sound => {
                registerSoundTrigger(sound.id, sound.url);
            });
            playAmbientLoop('wind-ambient');
            bindTriggersToElements();
        }
        
        // 4. Render content sections
        const container = document.getElementById('content-area');
        if (container && marsResponse?.data?.length) {
            bindDataToElements(marsResponse.data);
        }
        
        // 5. Setup interactions & animations
        attachAudioTriggers();
        
        // 6. Hero SVG animation
        const heroSvg = document.getElementById('mars-hero-svg');
        if (heroSvg) {
            renderSvgPath('mars-hero-svg', 'M 100 300 Q 400 100 700 300 T 100 300', 2000);
            animateSvgRotation('mars-hero-svg', 360, 12000);
        }
        
        console.log('Mars Site initialized successfully.');
        
    } catch (err) {
        console.error('Failed to initialize Mars Site:', err);
        const container = document.getElementById('content-area');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ff6b6b; font-family: var(--font-main);">
                    <h2>Failed to Load Experience</h2>
                    <p>Please check your connection and reload.</p>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', init);
