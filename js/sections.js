import { play, pauseAll } from './audio.js';
import { setHighlight } from './pluto-model.js';

/**
 * Inject scoped styles for the sections component.
 */
function injectSectionStyles() {
  const styleId = 'pluto-section-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .pluto-section {
      padding: 2.5rem 2.5rem 2.5rem 2.5rem;
      margin-bottom: 3rem;
      border-left: 4px solid var(--accent-color);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .pluto-section.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .pluto-section-header {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .pluto-section-number {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      font-size: 0.8rem;
      color: var(--accent-color);
      opacity: 0.5;
      letter-spacing: 0.08em;
      flex-shrink: 0;
    }

    .pluto-section-title {
      font-family: 'Newsreader', 'Source Serif 4', 'EB Garamond', Georgia, 'Noto Serif SC', serif;
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 400;
      color: var(--text-color);
      margin: 0;
      line-height: 1.35;
      letter-spacing: -0.01em;
    }

    .pluto-section-content {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
      font-size: 1.05rem;
      line-height: 1.8;
      color: rgba(224, 230, 237, 0.82);
    }

    .pluto-section-content p {
      margin: 0 0 1rem;
    }

    .pluto-section-content p:last-child {
      margin-bottom: 0;
    }

    .pluto-section-content ul {
      margin: 0.75rem 0;
      padding-left: 1.5rem;
    }

    .pluto-section-content li {
      margin-bottom: 0.5rem;
    }

    .pluto-section-content strong {
      color: var(--text-color);
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
}

/**
 * @param {SectionData[]} sections
 * @param {HTMLElement} container
 */
export function renderSections(sections, container) {
  injectSectionStyles();
  container.innerHTML = '';

  sections.forEach((section, index) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'pluto-section';
    sectionEl.setAttribute('data-section-id', section.id);
    sectionEl.setAttribute('data-audio-cue', section.audioCue);
    if (section.highlightLayer) {
      sectionEl.setAttribute('data-highlight-layer', section.highlightLayer);
    }

    const headerEl = document.createElement('div');
    headerEl.className = 'pluto-section-header';

    const indexEl = document.createElement('span');
    indexEl.className = 'pluto-section-number';
    indexEl.textContent = `0${index + 1}`;

    const titleEl = document.createElement('h2');
    titleEl.className = 'pluto-section-title';
    titleEl.textContent = section.title;

    headerEl.appendChild(indexEl);
    headerEl.appendChild(titleEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'pluto-section-content';
    contentEl.innerHTML = section.content;

    sectionEl.appendChild(headerEl);
    sectionEl.appendChild(contentEl);
    container.appendChild(sectionEl);
  });
}

/**
 * @returns {void}
 */
export function setupScrollObserver() {
  const sections = document.querySelectorAll('.pluto-section');
  if (sections.length === 0) return;

  let currentSection = null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          const audioCue = entry.target.getAttribute('data-audio-cue');
          const layer = entry.target.getAttribute('data-highlight-layer');

          if (audioCue) {
            if (currentSection && currentSection !== entry.target) {
              const prevCue = currentSection.getAttribute('data-audio-cue');
              if (prevCue) {
                pauseAll(prevCue);
              }
            }
            play(audioCue);
          }

          if (layer) {
            setHighlight(layer);
          }

          currentSection = entry.target;
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: '-10% 0px -10% 0px'
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}
