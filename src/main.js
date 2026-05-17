import { initSounds, playSound } from './sounds.js';
import { initAnimations } from './animations.js';
import { initInteractions } from './interactions.js';

/**
 * Bootstraps the interactive physics website.
 * Initializes audio, animations, and interactions in dependency order.
 * @returns {void}
 */
export function initApp() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('[App] #app container not found');
    return;
  }

  // Initialize sounds on first user gesture
  const unlockAudio = async () => {
    await initSounds();
    playSound('click');
    document.body.removeEventListener('click', unlockAudio);
  };
  document.body.addEventListener('click', unlockAudio, { once: true });

  // Initialize visual and interaction modules
  initAnimations(app);
  initInteractions(app);

  console.log('[App] Initialization complete');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
