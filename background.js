(function () {
  'use strict';

  /**
   * Initializes a background image for the given container.
   * Adds a semi-transparent overlay to reduce visual clutter.
   * @param {string} containerId - id of the HTML element to apply background.
   * @param {Object} [options]
   * @param {string} [options.apiKey] - optional API key for external generation.
   * @param {string} [options.theme] - theme hint (e.g., 'calm', 'nature').
   * @returns {Promise<void>}
   */
  async function initBackground(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found: ' + containerId);

    // Add a fixed overlay to mute background clutter
    const overlay = document.createElement('div');
    overlay.className = 'medrem-bg-overlay';
    overlay.style.cssText =
      'position:fixed; top:0;left:0;right:0;bottom:0;' +
      'background:rgba(250,245,239,0.82);' +
      'z-index:0; pointer-events:none;';
    document.body.appendChild(overlay);

    // Move container above overlay
    container.style.position = 'relative';
    container.style.zIndex = '1';
  }

  window.MedRemBackground = {
    initBackground
  };
})();
