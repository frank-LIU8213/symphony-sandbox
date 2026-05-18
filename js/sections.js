import { SectionData } from './types.js';
import { trigger } from './animations.js';
import { play } from './audio.js';

/**
 * @param {SectionData[]} sections
 * @param {HTMLElement} container
 */
export function renderSections(sections, container) {
  container.innerHTML = '';
  sections.forEach(section => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'pluto-section';
    sectionEl.dataset.sectionId = section.id;
    sectionEl.dataset.audioCue = section.audioCue;
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'pluto-section-title';
    titleEl.textContent = section.title;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'pluto-section-content';
    contentEl.textContent = section.content;
    
    const svgContainer = document.createElement('div');
    svgContainer.className = 'pluto-section-svg';
    svgContainer.dataset.svgId = section.svgId;
    svgContainer.dataset.animId = section.id;
    
    const svgPlaceholder = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgPlaceholder.setAttribute('viewBox', '0 0 400 400');
    svgPlaceholder.setAttribute('width', '100%');
    svgPlaceholder.setAttribute('height', '100%');
    svgPlaceholder.setAttribute('data-svg-id', section.svgId);
    svgPlaceholder.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#e0e6ed">SVG: ${section.svgId}</text>`;
    svgContainer.appendChild(svgPlaceholder);
    
    sectionEl.appendChild(titleEl);
    sectionEl.appendChild(contentEl);
    sectionEl.appendChild(svgContainer);
    container.appendChild(sectionEl);
  });
}

export function setupScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.dataset.sectionId;
        const audioCue = entry.target.dataset.audioCue;
        
        trigger(sectionId);
        if (audioCue) {
          play(audioCue);
        }
      }
    });
  }, {
    threshold: 0.3
  });

  document.querySelectorAll('.pluto-section').forEach(section => {
    observer.observe(section);
  });
}
