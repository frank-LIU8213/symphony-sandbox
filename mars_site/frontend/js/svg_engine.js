/**
 * SVG Engine for Mars Interactive Experience
 * Handles SVG creation, path drawing, and element animations.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export function initSvgEngine() {
    const svg = document.getElementById('mars-hero-svg');
    if (!svg) return;

    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('xmlns', SVG_NS);

    // Create defs for gradients and filters
    const defs = createSvgElement('defs');
    defs.innerHTML = `
        <radialGradient id="marsGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ff8a65" />
            <stop offset="50%" stop-color="#d84315" />
            <stop offset="100%" stop-color="#870000" />
        </radialGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        <filter id="atmosphereGlow">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    `;
    svg.appendChild(defs);

    // Background stars
    createStars(svg, 150);

    // Atmosphere glow
    const atmosphere = createSvgElement('circle', {
        cx: 400, cy: 300, r: 180,
        fill: 'none',
        stroke: 'rgba(255, 107, 107, 0.3)',
        'stroke-width': '15',
        filter: 'url(#atmosphereGlow)'
    });
    svg.appendChild(atmosphere);

    // Mars sphere
    const mars = createSvgElement('circle', {
        id: 'mars-sphere',
        cx: 400, cy: 300, r: 150,
        fill: 'url(#marsGradient)',
        filter: 'url(#glow)'
    });
    svg.appendChild(mars);

    // Craters
    createCraters(svg);

    // Orbiting particles
    createOrbitingParticles(svg);

    // Add interactivity to Mars sphere
    mars.addEventListener('mouseenter', () => {
        mars.style.transition = 'r 0.5s ease-in-out';
        mars.setAttribute('r', '160');
    });
    mars.addEventListener('mouseleave', () => {
        mars.style.transition = 'r 0.5s ease-in-out';
        mars.setAttribute('r', '150');
    });

    console.log('SVG engine initialized');
}

function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    return el;
}

function createStars(svg, count) {
    const group = createSvgElement('g', { class: 'stars' });
    for (let i = 0; i < count; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 600;
        const r = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.8 + 0.2;
        const star = createSvgElement('circle', {
            cx: x, cy: y, r: r,
            fill: '#ffffff',
            opacity: opacity
        });
        group.appendChild(star);
    }
    svg.appendChild(group);
}

function createCraters(svg) {
    const group = createSvgElement('g', { class: 'craters' });
    const craters = [
        { cx: 350, cy: 250, r: 25 },
        { cx: 420, cy: 280, r: 35 },
        { cx: 380, cy: 350, r: 20 },
        { cx: 450, cy: 320, r: 15 },
        { cx: 320, cy: 310, r: 18 }
    ];

    craters.forEach(c => {
        const crater = createSvgElement('circle', {
            cx: c.cx, cy: c.cy, r: c.r,
            fill: 'rgba(0, 0, 0, 0.2)',
            stroke: 'rgba(0, 0, 0, 0.1)',
            'stroke-width': '2'
        });
        group.appendChild(crater);
    });
    svg.appendChild(group);
}

function createOrbitingParticles(svg) {
    const group = createSvgElement('g', { class: 'particles' });
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 190 + Math.random() * 30;
        const x = 400 + Math.cos(angle) * radius;
        const y = 300 + Math.sin(angle) * radius;
        const particle = createSvgElement('circle', {
            cx: x, cy: y, r: 2,
            fill: '#ff6b6b',
            opacity: 0.6
        });
        group.appendChild(particle);
    }
    svg.appendChild(group);
}

export function renderSvgPath(svgId, pathData, duration = 1000) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const path = createSvgElement('path', {
        d: pathData,
        fill: 'none',
        stroke: '#ff6b6b',
        'stroke-width': '2',
        'stroke-linecap': 'round'
    });

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;

    svg.appendChild(path);

    // Trigger animation
    requestAnimationFrame(() => {
        path.style.strokeDashoffset = '0';
    });
}

export function animateSvgRotation(svgId, degrees, duration = 2000) {
    const el = document.getElementById(svgId);
    if (!el) return;

    el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    el.style.transformOrigin = 'center';
    el.style.transform = `rotate(${degrees}deg)`;
}
