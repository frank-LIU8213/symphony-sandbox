import { initAudio } from './audio.js';
import { loadSections, loadPlutoData } from './content.js';
import { render } from './pluto-model.js';
import { renderSections, setupScrollObserver } from './sections.js';

/**
 * @returns {Promise<void>}
 */
export async function init() {
  // TODO: implement initialization sequence
}

document.addEventListener('DOMContentLoaded', init);