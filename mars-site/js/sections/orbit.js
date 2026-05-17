import { registerSection, anim, audio } from '../engine.js';

/**
 * @returns {import('../engine.js').SectionConfig}
 */
export function createOrbitSection() {
  return {
    id: 'orbit',
    /** @returns {void} */
    init() {
      const section = document.getElementById('orbit');
      section.innerHTML = `
        <svg viewBox="0 0 800 800" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffcc00" />
              <stop offset="100%" stop-color="#ff6600" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <circle cx="400" cy="400" r="45" fill="url(#sunGrad)" filter="url(#glow)" id="sun" />
          
          <g id="mercury-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="90" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="490" cy="400" r="7" fill="#a0a0a0" class="planet" id="mercury" data-name="Mercury" />
          </g>
          <g id="venus-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="130" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="530" cy="400" r="10" fill="#e6c288" class="planet" id="venus" data-name="Venus" />
          </g>
          <g id="earth-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="180" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="580" cy="400" r="11" fill="#4a90e2" class="planet" id="earth" data-name="Earth" />
          </g>
          <g id="mars-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="230" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="630" cy="400" r="9" fill="#c1440e" class="planet" id="mars" data-name="Mars" />
          </g>
          <g id="jupiter-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="300" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="700" cy="400" r="18" fill="#d4a373" class="planet" id="jupiter" data-name="Jupiter" />
          </g>
          <g id="saturn-orbit" class="orbit-group">
            <circle cx="400" cy="400" r="360" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
            <circle cx="760" cy="400" r="15" fill="#e9c46a" class="planet" id="saturn" data-name="Saturn" />
          </g>
        </svg>
        
        <div id="planet-info-panel" class="info-panel">
          <h2 id="planet-name" class="planet-name"></h2>
          <p id="planet-desc" class="planet-desc"></p>
        </div>
      `;

      const style = document.createElement('style');
      style.textContent = `
        .orbit-group {
          transform-origin: 400px 400px;
          animation: orbit linear infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .planet {
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .planet:hover {
          transform: scale(1.3);
          filter: drop-shadow(0 0 6px rgba(255,255,255,0.8));
        }
        .planet.highlighted {
          transform: scale(1.5);
          filter: drop-shadow(0 0 10px #ffcc00);
        }
        .info-panel {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(11, 13, 23, 0.85);
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
          backdrop-filter: blur(8px);
        }
        .info-panel.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .planet-name {
          margin: 0 0 8px 0;
          color: var(--accent);
          font-size: 1.5rem;
        }
        .planet-desc {
          margin: 0;
          color: var(--text-primary);
          font-size: 1rem;
          max-width: 300px;
        }
      `;
      style.setAttribute('data-orbit-section', 'true');
      document.head.appendChild(style);

      const orbits = section.querySelectorAll('.orbit-group');
      const speeds = [4, 7, 10, 14, 20, 30];
      orbits.forEach((orbit, i) => {
        if (speeds[i]) orbit.style.animationDuration = `${speeds[i]}s`;
      });

      const planets = section.querySelectorAll('.planet');
      const infoPanel = document.getElementById('planet-info-panel');
      const nameEl = document.getElementById('planet-name');
      const descEl = document.getElementById('planet-desc');

      const planetData = {
        Mercury: { desc: "The smallest planet, closest to the Sun. Days are scorching, nights are freezing." },
        Venus: { desc: "The hottest planet with a thick, toxic atmosphere that traps heat." },
        Earth: { desc: "Our home. The only known planet with liquid water and life." },
        Mars: { desc: "The Red Planet. Target for future human exploration and colonization." },
        Jupiter: { desc: "The largest planet. A gas giant with a Great Red Spot storm." },
        Saturn: { desc: "Famous for its spectacular ring system made of ice and rock." }
      };

      planets.forEach(planet => {
        planet.addEventListener('click', () => {
          planets.forEach(p => p.classList.remove('highlighted'));
          planet.classList.add('highlighted');
          
          const name = planet.getAttribute('data-name');
          nameEl.textContent = name;
          descEl.textContent = planetData[name]?.desc || "Explore this celestial body.";
          infoPanel.classList.add('visible');

          anim.animate('#' + planet.id, [
            { transform: 'scale(1.5)', filter: 'drop-shadow(0 0 10px #ffcc00)' },
            { transform: 'scale(1)', filter: 'drop-shadow(0 0 0px transparent)' }
          ], { duration: 400, easing: 'ease-out' });
          
          if (audio) audio.play('click');
        });
      });
    },
    /** @returns {void} */
    cleanup() {
      const style = document.querySelector('style[data-orbit-section]');
      if (style) style.remove();
    }
  };
}

registerSection(createOrbitSection());
