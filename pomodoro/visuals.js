/**
 * SVG ring animation and visual updates for the Pomodoro timer.
 */

const CIRCUMFERENCE = 2 * Math.PI * 45; // ~282.74
let _updateFn = null;

/**
 * Format total seconds into MM:SS.
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Initialises the SVG ring inside #pm-ring-container and returns an update function.
 * @returns {(state: import('./timer.js').TimerState) => void}
 */
export function initVisuals() {
  const container = document.getElementById('pm-ring-container');
  if (!container) throw new Error('#pm-ring-container not found');

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('xmlns', ns);
  svg.style.width = '100%';
  svg.style.height = '100%';

  // Background track
  const track = document.createElementNS(ns, 'circle');
  track.setAttribute('cx', '50');
  track.setAttribute('cy', '50');
  track.setAttribute('r', '45');
  track.setAttribute('fill', 'none');
  track.setAttribute('stroke', '#e0e0e0');
  track.setAttribute('stroke-width', '6');
  track.setAttribute('stroke-linecap', 'round');
  track.setAttribute('transform', 'rotate(-90 50 50)');
  svg.appendChild(track);

  // Progress ring
  const progress = document.createElementNS(ns, 'circle');
  progress.setAttribute('cx', '50');
  progress.setAttribute('cy', '50');
  progress.setAttribute('r', '45');
  progress.setAttribute('fill', 'none');
  progress.setAttribute('stroke', '#007AFF');
  progress.setAttribute('stroke-width', '6');
  progress.setAttribute('stroke-linecap', 'round');
  progress.setAttribute('transform', 'rotate(-90 50 50)');
  progress.setAttribute('stroke-dasharray', String(CIRCUMFERENCE));
  progress.setAttribute('stroke-dashoffset', '0');
  progress.style.transition = 'stroke-dashoffset 1s linear, stroke 0.3s ease';
  svg.appendChild(progress);

  container.appendChild(svg);

  /**
   * Update the ring and other visual elements based on the current timer state.
   * @param {import('./timer.js').TimerState} state
   */
  _updateFn = function updateVisuals(state) {
    const total = state.mode === 'work' ? state.workDuration : state.breakDuration;
    const fraction = total > 0 ? state.timeRemaining / total : 0;
    const offset = CIRCUMFERENCE * (1 - fraction);
    progress.setAttribute('stroke-dashoffset', String(offset));

    // Colour change between work and break
    const color = state.mode === 'work' ? '#007AFF' : '#34C759';
    progress.setAttribute('stroke', color);

    // Update text elements
    const timeEl = document.getElementById('pm-time-display');
    if (timeEl) timeEl.textContent = formatTime(state.timeRemaining);

    const modeEl = document.getElementById('pm-mode-indicator');
    if (modeEl) modeEl.textContent = state.mode === 'work' ? 'Work' : 'Break';
  };

  return _updateFn;
}

/**
 * Update the ring and other visual elements based on the current timer state.
 * (convenience export – delegates to the function returned by initVisuals)
 * @param {import('./timer.js').TimerState} state
 */
export function updateVisuals(state) {
  if (!_updateFn) throw new Error('initVisuals() must be called before updateVisuals()');
  _updateFn(state);
}

/**
 * Play a special animation, e.g., 'finish' or 'start'.
 * @param {string} type
 */
export function playAnimation(type) {
  const container = document.getElementById('pm-ring-container');
  if (!container) return;
  const svgEl = container.querySelector('svg');
  if (!svgEl) return;
  // remove previous animation classes
  svgEl.classList.remove('pm-finish-animation', 'pm-start-animation');
  if (type === 'finish') {
    svgEl.classList.add('pm-finish-animation');
    // let CSS handle the pulse; cleanup after animation
    setTimeout(() => svgEl.classList.remove('pm-finish-animation'), 700);
  } else if (type === 'start') {
    svgEl.classList.add('pm-start-animation');
    setTimeout(() => svgEl.classList.remove('pm-start-animation'), 500);
  }
}
