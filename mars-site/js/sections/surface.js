import { registerSection, anim, audio } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createSurfaceSection() {
  let scrollHandler = null;
  let observer = null;
  let injectedStyle = null;

  return {
    id: 'surface',
    /** @returns {void} */
    init() {
      const section = document.getElementById('surface');
      if (!section) return;

      // Inject HTML structure
      section.innerHTML = `
        <div class="surface-container">
          <div class="parallax-layer layer-bg" data-speed="0.2"></div>
          <div class="parallax-layer layer-mid" data-speed="0.5">
            <svg id="surfaceTerrain" viewBox="0 0 1200 400" preserveAspectRatio="none" class="terrain-svg">
              <path d="M0,300 Q150,250 300,280 T600,260 T900,290 T1200,270 L1200,400 L0,400 Z" fill="var(--mars-red)" opacity="0.6"/>
              <path d="M0,320 Q200,280 400,310 T800,290 T1200,300 L1200,400 L0,400 Z" fill="var(--mars-red)" opacity="0.8"/>
            </svg>
          </div>
          <div class="parallax-layer layer-fg" data-speed="0.8">
            <div class="mission-timeline">
              <h2>Mission Timeline</h2>
              <div class="timeline-track">
                <div class="timeline-node" data-step="1">Landing</div>
                <div class="timeline-node" data-step="2">Deploy</div>
                <div class="timeline-node" data-step="3">Explore</div>
              </div>
            </div>
            <svg id="rover" viewBox="0 0 100 100" class="rover-svg">
              <rect x="20" y="40" width="60" height="30" rx="5" fill="var(--text-primary)"/>
              <circle cx="30" cy="75" r="8" fill="var(--text-primary)"/>
              <circle cx="70" cy="75" r="8" fill="var(--text-primary)"/>
              <line x1="50" y1="40" x2="50" y2="20" stroke="var(--text-primary)" stroke-width="3"/>
              <circle cx="50" cy="15" r="5" fill="var(--accent)"/>
            </svg>
          </div>
        </div>
      `;

      // Inject scoped styles
      injectedStyle = document.createElement('style');
      injectedStyle.textContent = `
        .surface-container { position: relative; width: 100%; height: 100%; overflow: hidden; }
        .parallax-layer { position: absolute; width: 100%; height: 100%; will-change: transform; }
        .layer-bg { background: radial-gradient(circle at 50% 50%, #1a1d2e 0%, var(--bg-primary) 70%); }
        .layer-mid { bottom: 0; height: 40%; }
        .layer-fg { bottom: 0; height: 30%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 40px; }
        .terrain-svg { width: 100%; height: 100%; }
        .mission-timeline { text-align: center; margin-bottom: 20px; }
        .mission-timeline h2 { color: var(--accent); font-size: 1.5rem; margin-bottom: 10px; }
        .timeline-track { display: flex; gap: 20px; justify-content: center; }
        .timeline-node { padding: 8px 16px; border: 1px solid var(--accent); border-radius: 20px; cursor: pointer; transition: all 0.3s; color: var(--text-primary); }
        .timeline-node:hover, .timeline-node.active { background: var(--accent); color: var(--bg-primary); }
        .rover-svg { width: 120px; height: 120px; margin-top: 20px; }
      `;
      document.head.appendChild(injectedStyle);

      // Parallax scroll handler
      scrollHandler = () => {
        const scrollY = window.scrollY;
        const layers = section.querySelectorAll('.parallax-layer');
        layers.forEach(layer => {
          const speed = parseFloat(layer.dataset.speed) || 0.5;
          layer.style.transform = `translateY(${scrollY * speed}px)`;
        });
      };
      window.addEventListener('scroll', scrollHandler);

      // Continuous SVG animations
      anim.animate('#surfaceTerrain path:nth-child(1)', [
        { transform: 'translateX(0)', offset: 0 },
        { transform: 'translateX(-20px)', offset: 0.5 },
        { transform: 'translateX(0)', offset: 1 }
      ], { duration: 4000, iterations: Infinity, easing: 'ease-in-out' });

      anim.animate('#rover', [
        { transform: 'translateY(0) rotate(0deg)', offset: 0 },
        { transform: 'translateY(-5px) rotate(-2deg)', offset: 0.5 },
        { transform: 'translateY(0) rotate(0deg)', offset: 1 }
      ], { duration: 3000, iterations: Infinity, easing: 'ease-in-out' });

      // Timeline interaction & audio triggers
      const nodes = section.querySelectorAll('.timeline-node');
      nodes.forEach(node => {
        node.addEventListener('click', () => {
          nodes.forEach(n => n.classList.remove('active'));
          node.classList.add('active');
          const step = node.dataset.step;
          audio.play(`mission_step_${step}`);
          
          if (step === '1') {
            anim.animate('#rover', [
              { transform: 'scale(1)', offset: 0 },
              { transform: 'scale(1.2)', offset: 0.5 },
              { transform: 'scale(1)', offset: 1 }
            ], { duration: 1000, iterations: 1 });
          } else if (step === '2') {
            anim.animate('#rover', [
              { transform: 'translateX(0)', offset: 0 },
              { transform: 'translateX(30px)', offset: 1 }
            ], { duration: 1500, iterations: 1 });
          } else if (step === '3') {
            anim.animate('#rover', [
              { transform: 'rotate(0deg)', offset: 0 },
              { transform: 'rotate(15deg)', offset: 0.5 },
              { transform: 'rotate(0deg)', offset: 1 }
            ], { duration: 1000, iterations: 1 });
          }
        });
      });

      // Intersection Observer for ambient sound
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            audio.play('surface_wind', true);
          } else {
            audio.stop('surface_wind');
          }
        });
      }, { threshold: 0.5 });
      observer.observe(section);
    },
    /** @returns {void} */
    cleanup() {
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
      }
      if (observer) {
        observer.disconnect();
      }
      if (injectedStyle) {
        injectedStyle.remove();
      }
      const section = document.getElementById('surface');
      if (section) {
        section.innerHTML = '';
      }
    }
  };
}

registerSection(createSurfaceSection());
