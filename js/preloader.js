/* 
   preloader.js
   Hides the full-screen preloader once the page (fonts, images, audio)
   has finished loading. A minimum-display time avoids an unpleasant flash
   on fast connections, and a hard timeout guarantees it never gets stuck.
    */
(function () {
  const MIN_DISPLAY_MS = 500;
  const HARD_TIMEOUT_MS = 4000;
  const shownAt = Date.now();

  function hide() {
    const el = document.getElementById('preloader');
    if (!el || el.dataset.hidden) return;
    el.dataset.hidden = 'true';
    const elapsed = Date.now() - shownAt;
    const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
    setTimeout(() => {
      el.classList.add('hidden');
      document.body.classList.add('page-ready'); // triggers reveal animations
      document.dispatchEvent(new Event('app:ready'));
      setTimeout(() => el.remove(), 600);
    }, wait);
  }

  window.addEventListener('load', hide);
  setTimeout(hide, HARD_TIMEOUT_MS); // safety net
})();
