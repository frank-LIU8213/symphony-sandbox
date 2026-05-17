import { registerSection, anim, audio } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createOverviewSection() {
  /** @type {Animation[]} */
  let _animations = [];
  /** @type {SVGSVGElement | null} */
  let _svg = null;
  /** @type {(() => void) | null} */
  let _clickHandler = null;

  return {
    id: 'overview',
    /** @returns {void} */
    init() {
      const section = document.getElementById('overview');
      if (!section) return;

      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 400 400');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.maxWidth = '360px';
      svg.style.margin = '0 auto 2.5rem';
      svg.style.cursor = 'pointer';
      svg.style.transformBox = 'fill-box';
      svg.style.transformOrigin = 'center';
      _svg = svg;

      // Background grid
      const grid = document.createElementNS(svgNS, 'g');
      grid.setAttribute('id', 'marsGrid');
      grid.setAttribute('opacity', '0.1');
      for (let i = 0; i < 400; i += 40) {
        const lineH = document.createElementNS(svgNS, 'line');
        lineH.setAttribute('x1', '0'); lineH.setAttribute('y1', i);
        lineH.setAttribute('x2', '400'); lineH.setAttribute('y2', i);
        lineH.setAttribute('stroke', 'var(--text-primary)'); lineH.setAttribute('stroke-width', '1');
        grid.appendChild(lineH);
        const lineV = document.createElementNS(svgNS, 'line');
        lineV.setAttribute('x1', i); lineV.setAttribute('y1', '0');
        lineV.setAttribute('x2', i); lineV.setAttribute('y2', '400');
        lineV.setAttribute('stroke', 'var(--text-primary)'); lineV.setAttribute('stroke-width', '1');
        grid.appendChild(lineV);
      }
      svg.appendChild(grid);

      // Mars base
      const mars = document.createElementNS(svgNS, 'circle');
      mars.setAttribute('id', 'marsPlanet');
      mars.setAttribute('cx', '200');
      mars.setAttribute('cy', '200');
      mars.setAttribute('r', '100');
      mars.setAttribute('fill', 'var(--mars-red)');
      svg.appendChild(mars);

      // Atmosphere glow
      const glow = document.createElementNS(svgNS, 'circle');
      glow.setAttribute('id', 'marsAtmosphere');
      glow.setAttribute('cx', '200');
      glow.setAttribute('cy', '200');
      glow.setAttribute('r', '112');
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', 'var(--accent)');
      glow.setAttribute('stroke-width', '3');
      glow.setAttribute('opacity', '0.4');
      svg.appendChild(glow);

      // Craters
      const craters = [
        { cx: 160, cy: 170, r: 18 },
        { cx: 230, cy: 210, r: 24 },
        { cx: 190, cy: 240, r: 12 },
        { cx: 250, cy: 160, r: 15 }
      ];
      craters.forEach(c => {
        const crater = document.createElementNS(svgNS, 'circle');
        crater.setAttribute('cx', c.cx);
        crater.setAttribute('cy', c.cy);
        crater.setAttribute('r', c.r);
        crater.setAttribute('fill', 'rgba(0,0,0,0.25)');
        svg.appendChild(crater);
      });

      // Orbit ring
      const orbit = document.createElementNS(svgNS, 'ellipse');
      orbit.setAttribute('id', 'marsOrbit');
      orbit.setAttribute('cx', '200');
      orbit.setAttribute('cy', '200');
      orbit.setAttribute('rx', '160');
      orbit.setAttribute('ry', '60');
      orbit.setAttribute('fill', 'none');
      orbit.setAttribute('stroke', 'var(--accent)');
      orbit.setAttribute('stroke-width', '1.5');
      orbit.setAttribute('stroke-dasharray', '8 4');
      orbit.setAttribute('opacity', '0.6');
      svg.appendChild(orbit);

      // HUD circle
      const hud = document.createElementNS(svgNS, 'circle');
      hud.setAttribute('id', 'marsHud');
      hud.setAttribute('cx', '200');
      hud.setAttribute('cy', '200');
      hud.setAttribute('r', '140');
      hud.setAttribute('fill', 'none');
      hud.setAttribute('stroke', 'rgba(255,107,107,0.15)');
      hud.setAttribute('stroke-width', '1');
      hud.setAttribute('stroke-dasharray', '2 6');
      svg.appendChild(hud);

      section.appendChild(svg);

      // Animate atmosphere pulse
      _animations.push(anim.animate('#marsAtmosphere', [
        { opacity: 0.2, r: 110 },
        { opacity: 0.6, r: 116 },
        { opacity: 0.2, r: 110 }
      ], { duration: 4000, iterations: Infinity, easing: 'ease-in-out' }));

      // Animate orbit rotation
      _animations.push(anim.animate('#marsOrbit', [
        { transform: 'rotate(0deg)', transformOrigin: '200px 200px' },
        { transform: 'rotate(360deg)', transformOrigin: '200px 200px' }
      ], { duration: 20000, iterations: Infinity, easing: 'linear' }));

      // Interactive click
      _clickHandler = () => {
        anim.animate('#marsPlanet', [
          { transform: 'scale(1)', transformOrigin: '200px 200px' },
          { transform: 'scale(1.08)', transformOrigin: '200px 200px' },
          { transform: 'scale(1)', transformOrigin: '200px 200px' }
        ], { duration: 600, easing: 'ease-out' });
        audio.play('click_confirm');
      };
      svg.addEventListener('click', _clickHandler);

      // Play ambient sound
      // TODO runner: audio file missing - commented out to clear 404
      // audio.play('mars_ambient', true);

      // Content cards
      const facts = [
        { title: '红色星球', desc: '火星表面富含氧化铁（铁锈），使其呈现出标志性的红色外观。' },
        { title: '奥林帕斯山', desc: '太阳系中最大的火山，高度达21.9公里，几乎是珠穆朗玛峰的三倍。' },
        { title: '稀薄大气', desc: '主要由二氧化碳组成，气压仅为地球的1%，无法支持人类直接呼吸。' }
      ];

      const cardsContainer = document.createElement('div');
      cardsContainer.className = 'fact-cards';
      cardsContainer.style.display = 'flex';
      cardsContainer.style.gap = '1.5rem';
      cardsContainer.style.flexWrap = 'wrap';
      cardsContainer.style.justifyContent = 'center';
      cardsContainer.style.marginTop = '2rem';

      facts.forEach((fact, i) => {
        const card = document.createElement('div');
        card.className = 'fact-card';
        card.style.background = 'rgba(255,255,255,0.05)';
        card.style.border = '1px solid rgba(255,255,255,0.1)';
        card.style.borderRadius = '12px';
        card.style.padding = '1.5rem';
        card.style.flex = '1 1 220px';
        card.style.maxWidth = '320px';
        card.style.backdropFilter = 'blur(8px)';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        const title = document.createElement('h3');
        title.textContent = fact.title;
        title.style.color = 'var(--accent)';
        title.style.marginTop = '0';
        title.style.marginBottom = '0.5rem';

        const desc = document.createElement('p');
        desc.textContent = fact.desc;
        desc.style.lineHeight = '1.6';
        desc.style.fontSize = '0.95rem';

        card.appendChild(title);
        card.appendChild(desc);
        cardsContainer.appendChild(card);

        // Staggered entrance animation
        setTimeout(() => {
          _animations.push(anim.animate(card, [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 600, easing: 'ease-out', fill: 'forwards' }));
        }, 300 + i * 200);
      });

      section.appendChild(cardsContainer);
    },
    /** @returns {void} */
    cleanup() {
      if (_clickHandler && _svg) {
        _svg.removeEventListener('click', _clickHandler);
      }
      _animations.forEach(a => a.cancel());
      _animations = [];
      audio.stop('mars_ambient');
    }
  };
}

registerSection(createOverviewSection());
