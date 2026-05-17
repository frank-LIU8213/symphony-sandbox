/**
 * @typedef {Object} SectionConfig
 * @property {string} id
 * @property {() => void} init
 * @property {() => void} cleanup
 */

/**
 * @typedef {Object} AudioManager
 * @property {(id: string, loop?: boolean) => void} play
 * @property {(id: string) => void} stop
 */

/**
 * @typedef {Object} AnimationManager
 * @property {(selector: string, keyframes: Keyframe[], options?: KeyframeAnimationOptions) => void} animate
 */

/** @type {AnimationManager} */
export const anim = {
  /**
   * @param {string} selector
   * @param {Keyframe[]} keyframes
   * @param {KeyframeAnimationOptions} [options]
   * @returns {Animation | void}
   */
  animate(selector, keyframes, options = {}) {
    const el = document.querySelector(selector);
    if (!el) {
      console.warn(`[anim] Element not found: ${selector}`);
      return;
    }
    return el.animate(keyframes, options);
  }
};

/** @type {AudioManager} */
export const audio = {
  /** @type {Map<string, HTMLAudioElement>} */
  _players: new Map(),

  /**
   * @param {string} id
   * @param {boolean} [loop]
   */
  play(id, loop = false) {
    if (this._players.has(id)) {
      const existing = this._players.get(id);
      existing.currentTime = 0;
      existing.loop = loop;
      existing.play().catch(() => {
        console.warn(`[audio] Failed to play: ${id}`);
      });
      return;
    }
    const src = `assets/audio/${id}.mp3`;
    const player = new Audio(src);
    player.loop = loop;
    player.play().catch(() => {
      console.warn(`[audio] Failed to play: ${id} from ${src}`);
    });
    this._players.set(id, player);
  },

  /**
   * @param {string} id
   */
  stop(id) {
    const player = this._players.get(id);
    if (player) {
      player.pause();
      player.currentTime = 0;
    }
  }
};

/** @type {SectionConfig[]} */
const sections = [];

/**
 * @param {SectionConfig} config
 */
export function registerSection(config) {
  sections.push(config);
}

export function initSite() {
  // Initialize all registered sections
  for (const section of sections) {
    section.init();
  }

  // Setup smooth scrolling for navigation links
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Setup scroll observer for active nav state
  setupScrollObserver();
}

/**
 * Sets up IntersectionObserver to highlight active nav link based on scroll position
 */
function setupScrollObserver() {
  const navLinks = document.querySelectorAll('nav a');
  const sectionElements = document.querySelectorAll('section[id]');

  if (sectionElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.style.color = 'var(--accent)';
          } else {
            link.style.color = 'var(--text-primary)';
          }
        });
      }
    });
  }, {
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  });

  sectionElements.forEach(section => observer.observe(section));
}
