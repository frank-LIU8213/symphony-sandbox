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

    options = options || {};
    const headerText = options.headerText || '用药提醒';
    const particleCount = options.particleCount;
    const count = (typeof particleCount === 'number' && particleCount > 0)
      ? particleCount
      : 12;

    const body = document.body;

    // ---- Floating container (behind all static content) ----
    const floatContainer = document.createElement('div');
    floatContainer.className = 'med-decor-floating-container';
    body.prepend(floatContainer);

    for (let i = 0; i < count; i++) {
      const isPill = Math.random() > 0.5;
      const el = document.createElement('div');
      el.className = isPill ? 'med-decor-pill' : 'med-decor-leaf';

      // random size between 18px and 50px
      const size = 18 + Math.random() * 32;
      if (isPill) {
        el.style.width = size + 'px';
        el.style.height = (size * 0.45) + 'px';
      } else {
        el.style.width = size + 'px';
        el.style.height = (size * 0.6) + 'px';
        // random inline rotation (animation uses translate only)
        el.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      }

      // random position
      el.style.left = (Math.random() * 100) + '%';
      el.style.top  = (Math.random() * 100) + '%';

      // colour from Claude palette
      var colors = ['#b15b3a', '#c17b5a', '#e8ddd0', '#d4a594', '#a07a5a'];
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.opacity = (0.12 + Math.random() * 0.25).toFixed(3);

      // stagger animation start
      el.style.animationDelay = (Math.random() * 8) + 's';
      el.style.animationDuration = (10 + Math.random() * 10) + 's';

      floatContainer.appendChild(el);
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
    footer.textContent = 'MedReminder · 用药提醒 v1.0';
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
