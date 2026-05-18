import { initAudio, registerAudioAssets, setMasterVolume } from './audio.js';
import { loadSections, loadPlutoData } from './content.js';
import { render } from './pluto-model.js';
import { renderSections, setupScrollObserver } from './sections.js';

/**
 * @returns {Promise<void>}
 */
export async function init() {
  // 1. Initialize audio system
  initAudio();

  // 2. Register audio assets (required for play() to find assets)
  registerAudioAssets([
    { id: 'sfx-hover', src: 'assets/sfx-hover.mp3', type: 'sfx' },
    { id: 'sfx-click', src: 'assets/sfx-click.mp3', type: 'sfx' },
    { id: 'sfx-overview', src: 'assets/sfx-overview.mp3', type: 'sfx' },
    { id: 'sfx-structure', src: 'assets/sfx-structure.mp3', type: 'sfx' },
    { id: 'sfx-orbit', src: 'assets/sfx-orbit.mp3', type: 'sfx' },
    { id: 'ambient-space', src: 'assets/ambient-space.mp3', type: 'ambient' }
  ]);

  // 3. Load and render the interactive Pluto model
  const plutoConfig = loadPlutoData();
  const modelContainer = document.getElementById('pluto-model-container');
  if (modelContainer) {
    render(modelContainer, plutoConfig);
  }

  // 4. Load and render content sections
  const sections = await loadSections();
  const sectionsContainer = document.getElementById('sections-container');
  if (sectionsContainer) {
    renderSections(sections, sectionsContainer);
    setupScrollObserver();
  }

  // 5. Setup global audio controls
  setupAudioControls();
}

/**
 * Setup the master volume toggle button in the header.
 */
function setupAudioControls() {
  const volumeButton = document.getElementById('master-volume');
  if (!volumeButton) return;

  let isMuted = false;

  volumeButton.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      setMasterVolume(0);
      volumeButton.textContent = '🔇';
      volumeButton.setAttribute('aria-label', 'Unmute');
    } else {
      setMasterVolume(1);
      volumeButton.textContent = '🔊';
      volumeButton.setAttribute('aria-label', 'Mute');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
