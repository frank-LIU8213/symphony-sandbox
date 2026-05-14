(function () {
  'use strict';

  const STORAGE_KEY = 'medrem_theme_preference';
  const THEME_CLASS = 'med-theme-dark';
  let _initialized = false;

  /**
   * @returns {'light' | 'dark'}
   */
  function _getStoredTheme() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) { /* ignore */ }
    return 'light';
  }

  function _storeTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) { /* ignore */ }
  }

  /**
   * Apply a theme and persist to localStorage.
   * @param {'light' | 'dark'} theme
   */
  function applyTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add(THEME_CLASS);
    } else {
      html.classList.remove(THEME_CLASS);
    }
    _storeTheme(theme);

    const toggleBtn = document.getElementById('med-theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    const event = new CustomEvent('medrem-theme-changed', { detail: { theme } });
    document.dispatchEvent(event);
  }

  /**
   * @returns {'light' | 'dark'}
   */
  function getCurrentTheme() {
    return document.documentElement.classList.contains(THEME_CLASS) ? 'dark' : 'light';
  }

  /**
   * Creates theme toggle button and applies stored preference.
   * @param {string} [containerId] - ID of element where toggle should be appended.
   */
  function initThemeToggle(containerId) {
    if (_initialized) return;
    _initialized = true;

    const stored = _getStoredTheme();
    applyTheme(stored);

    const btn = document.createElement('button');
    btn.id = 'med-theme-toggle-btn';
    btn.className = 'med-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.textContent = stored === 'dark' ? '☀️' : '🌙';

    btn.addEventListener('click', function () {
      const current = getCurrentTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });

    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(btn);
        return;
      }
    }
    document.body.appendChild(btn);
  }

  window.MedRemTheming = {
    initThemeToggle,
    getCurrentTheme,
    applyTheme,
  };
})();
