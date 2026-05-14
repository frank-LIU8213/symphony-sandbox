/** Fetches and displays an AI-generated background image using nano banana2. */

let currentObjectUrl = null;

/**
 * Get the background layer element.
 * @returns {HTMLElement|null}
 */
function getBackgroundLayer() {
  return document.getElementById('pm-background-layer');
}

/**
 * Fetch a background image from the nano banana2 API.
 * @param {string} theme
 * @returns {Promise<string|null>} object URL or null on failure.
 */
async function fetchBackground(theme) {
  const url = `https://api.nanobanana2.com/generate?prompt=pomodoro&theme=${encodeURIComponent(theme)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('Background fetch failed:', err);
    return null;
  }
}

/**
 * Apply a background image (object URL) to the background layer.
 * @param {string|null} objectUrl
 */
function applyBackground(objectUrl) {
  const layer = getBackgroundLayer();
  if (!layer) return;

  // Revoke previous object URL to avoid memory leaks
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }
  currentObjectUrl = objectUrl;

  if (objectUrl) {
    layer.style.backgroundImage = `url(${objectUrl})`;
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
  } else {
    // Fallback gradient if image fetch fails
    layer.style.backgroundImage =
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    layer.style.backgroundSize = 'cover';
    layer.style.backgroundPosition = 'center';
  }
}

/**
 * Apply a full-screen background. Fetches from the API on first call and on theme change.
 * Uses the default theme (from settings) if no argument provided.
 */
export function initBackground() {
  // Try to use a stored theme (settings.js saves to local storage)
  const stored = localStorage.getItem('pm-backgroundTheme') || 'default';
  fetchBackground(stored).then((objectUrl) => {
    applyBackground(objectUrl);
  });
}

/**
 * @param {string} theme - the theme key to fetch a new background for.
 */
export function updateBackground(theme) {
  fetchBackground(theme).then((objectUrl) => {
    applyBackground(objectUrl);
  });
}
