import { initAudio, registerAudioAssets, setMasterVolume } from './audio.js';
import { loadSections, loadPlutoData } from './content.js';
import { render } from './pluto-model.js';
import { renderSections, setupScrollObserver } from './sections.js';

/**
 * @returns {Promise<void>}
 */
export async function init() {
  const loadingScreen = document.getElementById('loading-screen');
  
  try {
    // Initialize audio system
    initAudio();
    registerAudioAssets([
      { id: 'sfx-hover', src: 'assets/sfx-hover.mp3', type: 'sfx' },
      { id: 'sfx-click', src: 'assets/sfx-click.mp3', type: 'sfx' },
      { id: 'sfx-overview', src: 'assets/sfx-overview.mp3', type: 'sfx' },
      { id: 'sfx-structure', src: 'assets/sfx-structure.mp3', type: 'sfx' },
      { id: 'sfx-orbit', src: 'assets/sfx-orbit.mp3', type: 'sfx' },
      { id: 'ambient-space', src: 'assets/ambient-space.mp3', type: 'ambient' }
    ]);

    // Load and render Pluto 3D model
    const plutoConfig = loadPlutoData();
    const modelContainer = document.getElementById('pluto-model-container');
    if (modelContainer) {
      render(modelContainer, plutoConfig);
    }

    // Load and render content sections
    const sections = await loadSections();
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
      renderSections(sections, sectionsContainer);
      setupScrollObserver();
    }

    // Setup global controls
    setupAudioControls();
    setupFullscreenControl();

    // Hide loading screen
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.remove(), 600);
    }
  } catch (error) {
    console.error('Failed to initialize Pluto Explorer:', error);
    if (loadingScreen) {
      const text = loadingScreen.querySelector('.loading-text');
      if (text) text.textContent = '加载失败，请刷新页面重试';
    }
  }
}

function setupAudioControls() {
  const volumeButton = document.getElementById('master-volume');
  if (!volumeButton) return;
  
  let isMuted = false;
  volumeButton.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      setMasterVolume(0);
      volumeButton.textContent = '🔇';
      volumeButton.setAttribute('aria-label', '取消静音');
    } else {
      setMasterVolume(1);
      volumeButton.textContent = '🔊';
      volumeButton.setAttribute('aria-label', '静音');
    }
  });
}

function setupFullscreenControl() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (!fullscreenBtn) return;

  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen not supported or blocked:', err);
      });
    } else {
      document.exitFullscreen();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
