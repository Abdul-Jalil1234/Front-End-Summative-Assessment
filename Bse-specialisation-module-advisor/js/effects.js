/* 
 Implementing the functionality of the scroll progress bar ,glow cursor and the magnetic buttons .
   */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  /* 
      SCROLL PROGRESS BAR
     Recalculates on every scroll event how far down the page we are,
     as a percentage, and sets that as the fill bar's width..
     */
  function initScrollProgress() {
    const fill = document.getElementById('scrollProgressFill');
    if (!fill) return;

    let ticking = false;

    function update() {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
      fill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update(); // set the correct initial value in case the page loads mid-scroll (e.g. anchor link)
  }

  /* 
      GLOW CURSOR
     A glowing circle that follows the mouse, but doesn't teleport
     directly to it. Makes the cursor feel more "alive" and less like a static pointer.
     This is disabled for touch devices and for users who have requested
     reduced motion in their OS settings.
      */
  function initGlowCursor() {
    if (prefersReducedMotion || isTouchDevice) return;

    const glow = document.createElement('div');
    glow.id = 'cursorGlow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.style.opacity = '1';
    });

    // Fade out when the pointer leaves the window entirely (e.g. moves
    // up to the browser's own tab bar), so it doesn't linger stuck in
    // whatever the last position was.
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    const half = glow.offsetWidth / 2; // 170, from the 340px set in CSS

    function loop() {
      // Move 15% of the remaining distance to the target every frame.
      // Small fraction = more lag/smoothing; a value of 1 would mean
      // "teleport instantly," which is just normal 1:1 cursor tracking.
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      glow.style.transform = `translate3d(${currentX - half}px, ${currentY - half}px, 0)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* 
      MAGNETIC BUTTONS
     While the cursor is over a button, the button subtly shifts toward
     it (scaled down so it never moves far) — like the button has a weak
     magnetic pull. Moving off the button snaps it back to center via
     the CSS transition already defined on .magnetic.
      */
  function initMagneticButtons() {
    if (prefersReducedMotion || isTouchDevice) return;

    const SELECTOR = '.btn-primary, .theme-toggle';
    const PULL_STRENGTH = 0.35; // fraction of cursor offset the button actually moves
    let activeEl = null; // whichever matching button the cursor is currently over, if any

    document.addEventListener('mousemove', (e) => {
      const target = e.target.closest(SELECTOR);

      // Cursor moved off the previously-active button (onto something
      // else, or empty space) — snap it back to its resting position.
      if (target !== activeEl && activeEl) {
        activeEl.style.transform = 'translate(0, 0)';
      }

      if (target) {
        target.classList.add('magnetic'); // ensures the eased CSS transition applies, even first time seen
        const rect = target.getBoundingClientRect();
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);
        target.style.transform = `translate(${offsetX * PULL_STRENGTH}px, ${offsetY * PULL_STRENGTH}px)`;
      }

      activeEl = target;
    });
  }

  initScrollProgress();
  initGlowCursor();
  initMagneticButtons();
})();
