/* ==========================================================================
   theme.js
   Note: the THEME choice itself is applied earlier, by a tiny inline
   snippet in each page's <head> (before CSS paints) so there is no
   flash-of-wrong-theme on load. This file only wires up the toggle
   button's click behaviour and keeps its icon in sync.
   ========================================================================== */
(function () {
  const KEY = 'ljp_theme';
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  function applyIcon(theme) {
    btn.textContent = theme === 'light' ? '☾' : '☀';
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  applyIcon(document.documentElement.getAttribute('data-theme') || 'dark');

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
    applyIcon(next);
  });
})();
