import { PlutoModelConfig } from './types.js';
import { play } from './audio.js';

const LAYER_COLORS = {
  crust: '#8B9DAF',
  mantle: '#5C7A99',
  core: '#3A4A5C'
};

const LAYER_NAMES = {
  crust: 'Crust',
  mantle: 'Mantle',
  core: 'Core'
};

const LAYER_INFO = {
  crust: 'Water ice and rock surface',
  mantle: 'Water ice and ammonia hydrate',
  core: 'Rock and metal interior'
};

/**
 * @param {HTMLElement} container
 * @param {PlutoModelConfig} config
 */
export function render(container, config) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.cursor = 'pointer';

  const cx = 200;
  const cy = 200;
  const maxRadius = 150;

  // Create layers in reverse order (core first, then mantle, then crust)
  const layers = config.layers || ['core', 'mantle', 'crust'];
  const layerRadii = [maxRadius, maxRadius * 0.66, maxRadius * 0.33];

  layers.forEach((layerId, index) => {
    const r = layerRadii[index] || maxRadius;
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', LAYER_COLORS[layerId] || '#555');
    circle.setAttribute('stroke', '#222');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('data-layer', layerId);
    circle.style.transition = 'fill 0.3s ease, r 0.3s ease';
    
    // Hover effect
    circle.addEventListener('mouseenter', () => {
      circle.setAttribute('fill', '#fff');
      circle.setAttribute('r', r + 5);
      play('sfx-hover', 0.5);
    });
    
    circle.addEventListener('mouseleave', () => {
      circle.setAttribute('fill', LAYER_COLORS[layerId] || '#555');
      circle.setAttribute('r', r);
    });

    // Click effect
    circle.addEventListener('click', (e) => {
      e.stopPropagation();
      play('sfx-click', 0.8);
      showLayerInfo(container, layerId, LAYER_NAMES[layerId], LAYER_INFO[layerId]);
    });

    svg.appendChild(circle);
  });

  // Add title
  const title = document.createElementNS(svgNS, 'text');
  title.setAttribute('x', cx);
  title.setAttribute('y', 30);
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', '#e0e6ed');
  title.setAttribute('font-family', 'Inter, system-ui, sans-serif');
  title.setAttribute('font-size', '16');
  title.textContent = 'Pluto Internal Structure';
  svg.appendChild(title);

  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * @param {HTMLElement} container
 * @param {string} layerId
 * @param {string} name
 * @param {string} info
 */
function showLayerInfo(container, layerId, name, info) {
  // Remove existing info panel if any
  const existing = container.querySelector('.pluto-layer-info');
  if (existing) existing.remove();

  const infoDiv = document.createElement('div');
  infoDiv.className = 'pluto-layer-info';
  infoDiv.style.position = 'absolute';
  infoDiv.style.bottom = '20px';
  infoDiv.style.left = '50%';
  infoDiv.style.transform = 'translateX(-50%)';
  infoDiv.style.background = 'rgba(11, 13, 23, 0.9)';
  infoDiv.style.padding = '15px 25px';
  infoDiv.style.borderRadius = '8px';
  infoDiv.style.color = '#e0e6ed';
  infoDiv.style.fontFamily = 'Inter, system-ui, sans-serif';
  infoDiv.style.border = '1px solid #4a90e2';
  infoDiv.style.zIndex = '10';
  infoDiv.innerHTML = `<strong>${name}</strong><br>${info}`;
  
  container.style.position = 'relative';
  container.appendChild(infoDiv);
}

/**
 * @param {Event} event
 */
export function handleInteraction(event) {
  // Global interaction handler. Delegates to SVG elements if needed.
  // Currently, interactions are handled directly on SVG elements in render().
}
