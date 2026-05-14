(function () {
  'use strict';

  let initialized = false;

  /**
   * Injects decorative header, footer, and floating decorative elements
   * (pills / leaves) into document.body.
   * @param {{ headerText?: string, particleCount?: number }} [options]
   */
  function initDecorations(options) {
    if (initialized) return;
    initialized = true;

    const opts = options || {};
    const headerText = opts.headerText || '用药提醒';
    const particleCount =
      typeof opts.particleCount === 'number' && opts.particleCount > 0
        ? opts.particleCount
        : 15; // default to 15 per spec

    const body = document.body;

    // ---- Floating container (behind all static content) ----
    const floatContainer = document.createElement('div');
    floatContainer.className = 'med-decor-floating-container';
    body.prepend(floatContainer);

    const colors = ['#b15b3a', '#c17b5a', '#e8ddd0', '#d4a594', '#a07a5a'];

    for (let i = 0; i < particleCount; i++) {
      const isPill = Math.random() > 0.5;
      const particle = document.createElement('div');
      particle.className =
        'med-decor-particle ' + (isPill ? 'med-decor-pill' : 'med-decor-leaf');

      // size between 10‑30 px
      const size = Math.floor(10 + Math.random() * 21);
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      // random start position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';

      // colour from Claude palette
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.color = color;

      // SVG icon (pill or leaf)
      if (isPill) {
        particle.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">' +
          '<rect x="4" y="7" width="16" height="10" rx="4" fill="currentColor"/>' +
          '</svg>';
      } else {
        particle.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">' +
          '<path d="M12 2 L4 8 L4 18 L12 22 L20 18 L20 8Z" fill="currentColor"/>' +
          '</svg>';
      }

      // stagger animation start / duration
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = 10 + Math.random() * 10 + 's';

      floatContainer.appendChild(particle);
    }

    // ---- Decorative header (subtle gradient backdrop) ----
    const header = document.createElement('div');
    header.className = 'med-decor-header';
    header.innerHTML =
      '<span class="med-decor-header__text">' +
      _escapeHtml(headerText) +
      '</span>';
    body.prepend(header); // behind floatContainer

    // ---- Footer ----
    const footer = document.createElement('div');
    footer.className = 'med-decor-footer';
    footer.textContent = '© 2025 Medication Reminder';
    body.appendChild(footer);
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  function _escapeHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  window.MedRemDecorations = {
    initDecorations: initDecorations
  };
})();
