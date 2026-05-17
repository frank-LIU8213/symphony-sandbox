/**
 * Initializes interactive controls for E=mc² and light speed demos.
 * @param {HTMLElement} root - The #app container.
 * @returns {void}
 */
import { playSound } from './sounds.js';
import { triggerAnimation } from './animations.js';

export function initInteractions(root) {
  const massSlider = root.querySelector('#mass-slider');
  const massValue = root.querySelector('#mass-value');
  const energyDisplay = root.querySelector('#energy-display');
  const speedToggle = root.querySelector('#toggle-speed');

  if (!massSlider || !massValue || !energyDisplay) return;

  massSlider.addEventListener('input', (e) => {
    const mass = Number(e.target.value);
    massValue.textContent = mass;
    // E = mc^2
    const c = 299792458;
    const energy = mass * c * c;
    energyDisplay.textContent = `Energy: ${energy.toExponential(2)} J`;
    playSound('click');
  });

  if (speedToggle) {
    let isActive = false;
    speedToggle.addEventListener('click', () => {
      isActive = !isActive;
      speedToggle.textContent = isActive ? 'Stop Light Speed' : 'Toggle Light Speed';
      if (isActive) {
        triggerAnimation('light-particle');
        playSound('whoosh');
      }
    });
  }
}
