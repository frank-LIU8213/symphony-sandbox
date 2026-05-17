let animationFrameId = null;
let particles = [];
let trails = [];
let atomGroup = null;
let lightParticlesGroup = null;
let speedTrailsGroup = null;
let nucleus = null;

/**
 * Initializes SVG animations for the hero and light-speed sections.
 * @param {HTMLElement} root - The #app container.
 * @returns {void}
 */
export function initAnimations(root) {
  const heroSvg = root.querySelector('#hero-svg');
  const speedSvg = root.querySelector('#speed-svg');
  if (!heroSvg || !speedSvg) return;

  atomGroup = heroSvg.querySelector('#atom-group');
  lightParticlesGroup = heroSvg.querySelector('#light-particles');
  speedTrailsGroup = speedSvg.querySelector('#speed-trails');

  if (!atomGroup || !lightParticlesGroup || !speedTrailsGroup) return;

  createAtom();
  createLightParticles();
  createSpeedTrails();

  startAnimationLoop();
}

/**
 * Triggers a specific SVG animation sequence.
 * @param {'atom' | 'light-particle'} target 
 * @returns {void}
 */
export function triggerAnimation(target) {
  if (target === 'atom') {
    if (nucleus) {
      nucleus.setAttribute('transform', 'translate(400, 200) scale(1.5)');
      setTimeout(() => {
        nucleus.setAttribute('transform', 'translate(400, 200) scale(1)');
      }, 200);
    }
  } else if (target === 'light-particle') {
    for (let i = 0; i < 10; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', Math.random() * 3 + 1);
      circle.setAttribute('fill', '#00f3ff');
      lightParticlesGroup.appendChild(circle);
      
      particles.push({
        el: circle,
        x: 400,
        y: 200,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 50 + Math.random() * 50
      });
    }
  }
}

function createAtom() {
  // Nucleus
  const nucleusGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nucleusGroup.setAttribute('id', 'nucleus');
  nucleusGroup.setAttribute('transform', 'translate(400, 200)');
  
  const protons = [
    { cx: 0, cy: 0, r: 12, fill: '#00f3ff' },
    { cx: 10, cy: 5, r: 10, fill: '#ff0055' },
    { cx: -10, cy: 5, r: 10, fill: '#ff0055' },
    { cx: 0, cy: -10, r: 10, fill: '#ff0055' },
    { cx: 5, cy: 10, r: 10, fill: '#ff0055' },
    { cx: -5, cy: 10, r: 10, fill: '#ff0055' },
  ];

  protons.forEach(p => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.cx);
    circle.setAttribute('cy', p.cy);
    circle.setAttribute('r', p.r);
    circle.setAttribute('fill', p.fill);
    nucleusGroup.appendChild(circle);
  });

  atomGroup.appendChild(nucleusGroup);
  nucleus = nucleusGroup;

  // Orbits
  const orbitAngles = [0, 60, 120];
  orbitAngles.forEach((angle, i) => {
    const orbitGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    orbitGroup.setAttribute('id', `orbit-${i + 1}`);
    orbitGroup.setAttribute('transform', `rotate(${angle})`);
    
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('cx', 0);
    ellipse.setAttribute('cy', 0);
    ellipse.setAttribute('rx', 150);
    ellipse.setAttribute('ry', 50);
    ellipse.setAttribute('fill', 'none');
    ellipse.setAttribute('stroke', '#00f3ff');
    ellipse.setAttribute('stroke-width', '1');
    ellipse.setAttribute('opacity', '0.5');
    orbitGroup.appendChild(ellipse);

    const electron = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    electron.setAttribute('id', `electron-${i + 1}`);
    electron.setAttribute('cx', 150);
    electron.setAttribute('cy', 0);
    electron.setAttribute('r', 5);
    electron.setAttribute('fill', '#00f3ff');
    orbitGroup.appendChild(electron);

    atomGroup.appendChild(orbitGroup);
  });
}

function createLightParticles() {
  for (let i = 0; i < 20; i++) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', Math.random() * 2 + 1);
    circle.setAttribute('fill', '#00f3ff');
    lightParticlesGroup.appendChild(circle);
    
    particles.push({
      el: circle,
      x: Math.random() * 800,
      y: Math.random() * 400,
      vx: Math.random() * 2 + 1,
      vy: (Math.random() - 0.5) * 0.5,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100
    });
  }
}

function createSpeedTrails() {
  for (let i = 0; i < 10; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#00f3ff');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('opacity', Math.random() * 0.5 + 0.2);
    speedTrailsGroup.appendChild(line);
    
    trails.push({
      el: line,
      x: Math.random() * 800,
      y: Math.random() * 200,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 5 + 2
    });
  }
}

function startAnimationLoop() {
  function loop() {
    updateParticles();
    updateTrails();
    updateAtom();
    animationFrameId = requestAnimationFrame(loop);
  }
  loop();
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    if (p.x > 800 || p.life > p.maxLife) {
      p.x = 0;
      p.y = Math.random() * 400;
      p.life = 0;
      p.maxLife = 100 + Math.random() * 100;
    }

    p.el.setAttribute('cx', p.x);
    p.el.setAttribute('cy', p.y);
    p.el.setAttribute('opacity', 1 - (p.life / p.maxLife));
  });
}

function updateTrails() {
  trails.forEach(t => {
    t.x += t.speed;
    if (t.x > 800) {
      t.x = -t.length;
      t.y = Math.random() * 200;
      t.speed = Math.random() * 5 + 2;
    }

    t.el.setAttribute('x1', t.x);
    t.el.setAttribute('y1', t.y);
    t.el.setAttribute('x2', t.x + t.length);
    t.el.setAttribute('y2', t.y);
  });
}

function updateAtom() {
  // Rotate orbits
  const orbits = atomGroup.querySelectorAll('g[id^="orbit-"]');
  orbits.forEach((orbit, i) => {
    const currentRotation = parseFloat(orbit.getAttribute('transform').match(/rotate\(([\d.]+)\)/)[1]);
    const speed = 10 + i * 5;
    const newRotation = (currentRotation + speed * 0.01) % 360;
    orbit.setAttribute('transform', `rotate(${newRotation})`);
  });

  // Pulse nucleus
  if (nucleus) {
    const time = Date.now() * 0.001;
    const scale = 1 + Math.sin(time * 2) * 0.1;
    nucleus.setAttribute('transform', `translate(400, 200) scale(${scale})`);
  }
}
