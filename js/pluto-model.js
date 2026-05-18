import { play } from './audio.js';

/** @type {HTMLElement | null} */
let svgElement = null;
/** @type {string | null} */
let currentHighlight = null;
/** @type {number} */
let rotationAngle = 0;
/** @type {number | null} */
let animationFrameId = null;

/**
 * @param {HTMLElement} container
 * @param {PlutoModelConfig} config
 */
export function render(container, config) {
  container.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 800 800');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.classList.add('pluto-model-svg');
  svgElement = svg;

  // --- defs: gradients, filters ---
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  // Core gradient (rocky, warm)
  defs.appendChild(createRadialGradient(defs, 'core-grad', '#ff8a6b', '#cc4433', '#661111'));
  // Mantle gradient (icy, cool blue-grey)
  defs.appendChild(createRadialGradient(defs, 'mantle-grad', '#7a9ab5', '#4a6a8a', '#1a3a5a'));
  // Crust gradient (mixed ice/rock)
  defs.appendChild(createRadialGradient(defs, 'crust-grad', '#9baebf', '#6b7d8f', '#3b4d5f'));

  // Glow filter for highlights
  const glowFilter = createGlowFilter(defs, 'glow');
  defs.appendChild(glowFilter);

  // Subtle shadow for depth
  const shadowFilter = createShadowFilter(defs, 'shadow');
  defs.appendChild(shadowFilter);

  svg.appendChild(defs);

  // --- starfield background ---
  const starsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  starsGroup.classList.add('pluto-stars');
  for (let i = 0; i < 120; i++) {
    const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    star.setAttribute('cx', String(Math.random() * 800));
    star.setAttribute('cy', String(Math.random() * 800));
    star.setAttribute('r', String(Math.random() * 1.2 + 0.3));
    star.setAttribute('fill', '#ffffff');
    star.setAttribute('opacity', String(Math.random() * 0.6 + 0.2));
    starsGroup.appendChild(star);
  }
  svg.appendChild(starsGroup);

  // --- orbit rings ---
  const orbitGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  orbitGroup.classList.add('pluto-orbits');
  [230, 270, 310].forEach((radius, i) => {
    const orbit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    orbit.setAttribute('cx', '400');
    orbit.setAttribute('cy', '400');
    orbit.setAttribute('r', String(radius));
    orbit.setAttribute('fill', 'none');
    orbit.setAttribute('stroke', '#00d4ff');
    orbit.setAttribute('stroke-width', '0.8');
    orbit.setAttribute('stroke-dasharray', `${4 + i * 2} ${8 + i * 4}`);
    orbit.setAttribute('opacity', '0.25');
    orbit.classList.add('pluto-orbit-ring');
    orbitGroup.appendChild(orbit);
  });
  svg.appendChild(orbitGroup);

  // --- Pluto layers group (rotates) ---
  const layersGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layersGroup.classList.add('pluto-layers');

  // Core (rocky metal center)
  const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  core.setAttribute('cx', '400');
  core.setAttribute('cy', '400');
  core.setAttribute('r', '75');
  core.setAttribute('fill', 'url(#core-grad)');
  core.setAttribute('class', 'pluto-layer pluto-layer-core');
  core.setAttribute('data-layer', 'core');
  core.style.cursor = 'pointer';
  layersGroup.appendChild(core);

  // Mantle (water ice / ammonia hydrate)
  const mantle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  mantle.setAttribute('cx', '400');
  mantle.setAttribute('cy', '400');
  mantle.setAttribute('r', '135');
  mantle.setAttribute('fill', 'url(#mantle-grad)');
  mantle.setAttribute('class', 'pluto-layer pluto-layer-mantle');
  mantle.setAttribute('data-layer', 'mantle');
  mantle.style.cursor = 'pointer';
  layersGroup.appendChild(mantle);

  // Crust (water ice + rock)
  const crust = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  crust.setAttribute('cx', '400');
  crust.setAttribute('cy', '400');
  crust.setAttribute('r', '195');
  crust.setAttribute('fill', 'url(#crust-grad)');
  crust.setAttribute('class', 'pluto-layer pluto-layer-crust');
  crust.setAttribute('data-layer', 'crust');
  crust.style.cursor = 'pointer';
  layersGroup.appendChild(crust);

  // Surface texture dots (craters)
  const craters = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  craters.classList.add('pluto-craters');
  const craterPositions = [
    { cx: 340, cy: 320, r: 12 }, { cx: 460, cy: 380, r: 8 },
    { cx: 380, cy: 480, r: 15 }, { cx: 440, cy: 300, r: 6 },
    { cx: 300, cy: 420, r: 10 }, { cx: 500, cy: 440, r: 7 },
    { cx: 360, cy: 260, r: 9 }, { cx: 480, cy: 500, r: 11 },
  ];
  craterPositions.forEach(c => {
    const crater = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    crater.setAttribute('cx', String(c.cx));
    crater.setAttribute('cy', String(c.cy));
    crater.setAttribute('r', String(c.r));
    crater.setAttribute('fill', 'rgba(0,0,0,0.15)');
    crater.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    crater.setAttribute('stroke-width', '1');
    craters.appendChild(crater);
  });
  layersGroup.appendChild(craters);

  svg.appendChild(layersGroup);

  // --- Labels with leader lines ---
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsGroup.classList.add('pluto-labels');

  const labelData = [
    { layer: 'core', text: 'Core', angle: -50, dist: 95 },
    { layer: 'mantle', text: 'Mantle', angle: 50, dist: 155 },
    { layer: 'crust', text: 'Crust', angle: 140, dist: 215 },
  ];

  labelData.forEach(ld => {
    const rad = (ld.angle * Math.PI) / 180;
    const outerX = 400 + Math.cos(rad) * ld.dist;
    const outerY = 400 + Math.sin(rad) * ld.dist;
    const innerR = ld.layer === 'core' ? 75 : ld.layer === 'mantle' ? 135 : 195;
    const innerX = 400 + Math.cos(rad) * innerR;
    const innerY = 400 + Math.sin(rad) * innerR;

    // Leader line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(innerX));
    line.setAttribute('y1', String(innerY));
    line.setAttribute('x2', String(outerX));
    line.setAttribute('y2', String(outerY));
    line.setAttribute('stroke', '#00d4ff');
    line.setAttribute('stroke-width', '0.8');
    line.setAttribute('opacity', '0.4');
    labelsGroup.appendChild(line);

    // Dot at layer edge
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', String(innerX));
    dot.setAttribute('cy', String(innerY));
    dot.setAttribute('r', '2.5');
    dot.setAttribute('fill', '#00d4ff');
    dot.setAttribute('opacity', '0.6');
    labelsGroup.appendChild(dot);

    // Text label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(outerX));
    text.setAttribute('y', String(outerY));
    text.setAttribute('fill', '#00d4ff');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-family', 'monospace');
    text.setAttribute('text-anchor', ld.angle > 0 ? 'start' : 'end');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('class', `pluto-label pluto-label-${ld.layer}`);
    text.setAttribute('pointer-events', 'none');
    text.textContent = ld.text;
    labelsGroup.appendChild(text);
  });

  svg.appendChild(labelsGroup);

  // --- HUD overlay (tech feel) ---
  const hudGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  hudGroup.classList.add('pluto-hud');

  // Top-left info panel
  const infoPanel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  infoPanel.setAttribute('transform', 'translate(20, 20)');

  const panelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  panelBg.setAttribute('width', '180');
  panelBg.setAttribute('height', '80');
  panelBg.setAttribute('rx', '4');
  panelBg.setAttribute('fill', 'rgba(0, 212, 255, 0.08)');
  panelBg.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
  panelBg.setAttribute('stroke-width', '0.5');
  infoPanel.appendChild(panelBg);

  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', '12');
  titleText.setAttribute('y', '22');
  titleText.setAttribute('fill', '#00d4ff');
  titleText.setAttribute('font-size', '11');
  titleText.setAttribute('font-family', 'monospace');
  titleText.setAttribute('letter-spacing', '2');
  titleText.textContent = 'PLUTO';
  infoPanel.appendChild(titleText);

  const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subText.setAttribute('x', '12');
  subText.setAttribute('y', '40');
  subText.setAttribute('fill', 'rgba(224, 230, 237, 0.6)');
  subText.setAttribute('font-size', '9');
  subText.setAttribute('font-family', 'monospace');
  subText.textContent = 'Dwarf Planet · Kuiper Belt';
  infoPanel.appendChild(subText);

  const radiusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  radiusText.setAttribute('x', '12');
  radiusText.setAttribute('y', '58');
  radiusText.setAttribute('fill', 'rgba(224, 230, 237, 0.5)');
  radiusText.setAttribute('font-size', '9');
  radiusText.setAttribute('font-family', 'monospace');
  radiusText.textContent = `Radius: ${config.radius} km`;
  infoPanel.appendChild(radiusText);

  hudGroup.appendChild(infoPanel);

  // Bottom-right rotation indicator
  const rotIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  rotIndicator.setAttribute('transform', 'translate(660, 720)');

  const rotCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  rotCircle.setAttribute('cx', '0');
  rotCircle.setAttribute('cy', '0');
  rotCircle.setAttribute('r', '18');
  rotCircle.setAttribute('fill', 'none');
  rotCircle.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
  rotCircle.setAttribute('stroke-width', '0.8');
  rotCircle.setAttribute('stroke-dasharray', '4 3');
  rotIndicator.appendChild(rotCircle);

  const rotText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  rotText.setAttribute('x', '0');
  rotText.setAttribute('y', '3');
  rotText.setAttribute('fill', 'rgba(0, 212, 255, 0.5)');
  rotText.setAttribute('font-size', '8');
  rotText.setAttribute('font-family', 'monospace');
  rotText.setAttribute('text-anchor', 'middle');
  rotText.textContent = 'ROT';
  rotIndicator.appendChild(rotText);

  hudGroup.appendChild(rotIndicator);

  svg.appendChild(hudGroup);

  container.appendChild(svg);

  setupInteractions(config);
  startAnimation(config);
}

/**
 * @param {string} layer
 */
export function setHighlight(layer) {
  if (!svgElement) return;

  // Reset previous
  if (currentHighlight) {
    const prev = svgElement.querySelector(`[data-layer="${currentHighlight}"]`);
    if (prev) {
      prev.classList.remove('highlighted');
      prev.style.filter = '';
    }
  }

  // Highlight new
  const target = svgElement.querySelector(`[data-layer="${layer}"]`);
  if (target) {
    target.classList.add('highlighted');
    target.style.filter = 'url(#glow)';
    currentHighlight = layer;
  }
}

/**
 * @returns {void}
 */
export function resetHighlight() {
  if (!svgElement) return;

  if (currentHighlight) {
    const prev = svgElement.querySelector(`[data-layer="${currentHighlight}"]`);
    if (prev) {
      prev.classList.remove('highlighted');
      prev.style.filter = '';
    }
    currentHighlight = null;
  }
}

// --- Helpers ---

function createRadialGradient(parent, id, c1, c2, c3) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
  g.setAttribute('id', id);
  g.setAttribute('cx', '30%');
  g.setAttribute('cy', '30%');
  g.setAttribute('r', '70%');

  [
    { offset: '0%', color: c1 },
    { offset: '55%', color: c2 },
    { offset: '100%', color: c3 },
  ].forEach(s => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', s.offset);
    stop.setAttribute('stop-color', s.color);
    g.appendChild(stop);
  });

  return g;
}

function createGlowFilter(parent, id) {
  const f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '-50%');
  f.setAttribute('y', '-50%');
  f.setAttribute('width', '200%');
  f.setAttribute('height', '200%');

  const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '10');
  blur.setAttribute('result', 'blur');
  f.appendChild(blur);

  const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const n1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  n1.setAttribute('in', 'blur');
  const n2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
  n2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(n1);
  merge.appendChild(n2);
  f.appendChild(merge);

  return f;
}

function createShadowFilter(parent, id) {
  const f = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  f.setAttribute('id', id);
  f.setAttribute('x', '-20%');
  f.setAttribute('y', '-20%');
  f.setAttribute('width', '140%');
  f.setAttribute('height', '140%');

  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
  shadow.setAttribute('dx', '0');
  shadow.setAttribute('dy', '4');
  shadow.setAttribute('stdDeviation', '8');
  shadow.setAttribute('flood-color', 'rgba(0,0,0,0.5)');
  f.appendChild(shadow);

  return f;
}

function setupInteractions(config) {
  if (!svgElement) return;

  const layers = svgElement.querySelectorAll('.pluto-layer');
  layers.forEach(layer => {
    layer.addEventListener('mouseenter', () => {
      play('sfx-hover');
      const name = layer.getAttribute('data-layer');
      setHighlight(name);
    });

    layer.addEventListener('mouseleave', () => {
      resetHighlight();
    });

    layer.addEventListener('click', () => {
      play('sfx-click');
      const name = layer.getAttribute('data-layer');
      if (currentHighlight === name) {
        resetHighlight();
      } else {
        setHighlight(name);
      }
    });
  });
}

function startAnimation(config) {
  if (!svgElement) return;

  const layersGroup = svgElement.querySelector('.pluto-layers');
  const orbits = svgElement.querySelectorAll('.pluto-orbit-ring');

  function animate() {
    rotationAngle += config.rotationSpeed * 60; // normalize to ~60fps

    if (layersGroup) {
      layersGroup.style.transform = `rotate(${rotationAngle}deg)`;
      layersGroup.style.transformOrigin = '400px 400px';
    }

    orbits.forEach((orbit, i) => {
      const speed = config.rotationSpeed * (i + 1) * 0.4;
      orbit.style.transform = `rotate(${rotationAngle * speed}deg)`;
      orbit.style.transformOrigin = '400px 400px';
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}
