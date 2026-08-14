/* 
   results.js
    */

const CATEGORY_INFO = {
  LL: {
    name: 'Low-Level Programming',
    cssVar: '--cat-lowlevel',
    desc: 'You keep gravitating toward the machine itself — memory, performance, and control. You\'re a strong fit for Low-Level Programming, where you\'ll work close to hardware in systems, compilers, and performance-critical code.',
    steps: [
      'Sit in on an Operating Systems or Computer Architecture lecture.',
      'Try a small project in C or Rust — a memory allocator or a tiny shell.',
      'Talk to a Low-Level Programming advisor about the course sequence.',
    ],
    goFurther: [
      { title: 'Computer Science roadmap', sub: 'roadmap.sh — CS fundamentals, memory, architecture', url: 'https://roadmap.sh/computer-science' },
      { title: 'Video: Systems & C programming crash courses', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=C+programming+systems+crash+course' },
      { title: 'Video: How CPUs actually work', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=how+CPUs+work+computer+architecture' },
    ],
  },
  AR: {
    name: 'AR / VR',
    cssVar: '--cat-arvr',
    desc: 'You think in space, not just in text. AR/VR suits people who want to design experiences users step into, not just look at — from headset interaction design to real-time 3D rendering.',
    steps: [
      'Try a free Unity or Unreal tutorial to build a tiny 3D scene.',
      'Visit the campus XR lab if one is available for a headset demo.',
      'Talk to an AR/VR advisor about prerequisite maths (linear algebra).',
    ],
    goFurther: [
      { title: 'Game Developer roadmap', sub: 'roadmap.sh — closest official path to AR/VR engines', url: 'https://roadmap.sh/game-developer' },
      { title: 'Video: Unity beginner tutorials', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=unity+beginner+tutorial+2026' },
      { title: 'Video: Intro to AR/VR development', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=intro+to+AR+VR+development' },
    ],
  },
  FS: {
    name: 'Full-Stack Web Development',
    cssVar: '--cat-fullstack',
    desc: 'You like the whole picture — database to interface, and shipping something real. Full-Stack Web Development fits people who want to build complete, usable products end to end.',
    steps: [
      'Build a small full-stack app (auth + database + UI) this month.',
      'Learn one framework end-to-end rather than sampling many.',
      'Talk to a Full-Stack advisor about internship-ready project ideas.',
    ],
    goFurther: [
      { title: 'Full-Stack Developer roadmap', sub: 'roadmap.sh — official path', url: 'https://roadmap.sh/full-stack' },
      { title: 'Video: Full-stack project tutorials', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=full+stack+web+development+project+tutorial' },
      { title: 'Video: React + Node from scratch', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=react+node+full+stack+from+scratch' },
    ],
  },
  ML: {
    name: 'Machine Learning',
    cssVar: '--cat-ml',
    desc: 'You\'re drawn to patterns and what data actually means. Machine Learning fits people who like turning messy information into predictions that improve with more evidence.',
    steps: [
      'Work through a short intro to Python data analysis (pandas/numpy).',
      'Train a simple classifier on a small public dataset.',
      'Talk to a Machine Learning advisor about the maths-heavy prerequisites.',
    ],
    goFurther: [
      { title: 'Machine Learning roadmap', sub: 'roadmap.sh — official path', url: 'https://roadmap.sh/machine-learning' },
      { title: 'Video: Machine learning for beginners', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=machine+learning+for+beginners+full+course' },
      { title: 'Video: PyTorch / TensorFlow crash course', sub: 'YouTube search', url: 'https://www.youtube.com/results?search_query=pytorch+tensorflow+crash+course' },
    ],
  },
};

/* 
   Marquee: "recent completions on this device"
   The feed is scoped to localStorage on the visitor's own browser — seeded with a few sample
   rows the first time so it never looks empty, then genuinely appended to
   every time this browser finishes a real quiz.
    */
function updateCompletionFeed(newEntry) {
  const KEY = 'ljp_recent_completions';
  let feed = [];
  try { feed = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { feed = []; }

  if (feed.length === 0) {
    feed = [
      { name: 'J. Appadoo', cat: 'FS' },
      { name: 'R. Beeharry', cat: 'ML' },
      { name: 'S. Chundunsing', cat: 'AR' },
      { name: 'K. Pillay', cat: 'LL' },
      { name: 'A. Ramdin', cat: 'FS' },
    ];
  }

  if (newEntry) {
    feed.push(newEntry);
    feed = feed.slice(-12); // keep it bounded -only the last 12 completions are shownin the marquee.
    localStorage.setItem(KEY, JSON.stringify(feed));
  }
  return feed;
}

function renderMarquee(feed) {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const itemHtml = (entry) => {
    const info = CATEGORY_INFO[entry.cat];
    return `<span class="marquee-item"><span class="dot" style="background:var(${info.cssVar});"></span>${entry.name} matched with ${info.name}</span>`;
  };
  // Render the list twice back-to-back so the CSS translateX(-50%) loop is seamless.
  const html = feed.map(itemHtml).join('');
  track.innerHTML = html + html;
}

function onPageReady(fn) {
  if (document.body.classList.contains('page-ready')) fn();
  else document.addEventListener('app:ready', fn, { once: true });
}

(function init() {
  const profileRaw = sessionStorage.getItem('ljp_profile');
  const resultsRaw = sessionStorage.getItem('ljp_results');

  if (!resultsRaw) {
    // No quiz data yet — send the student to start one.
    window.location.href = 'quiz.html';
    return;
  }

  const profile = profileRaw ? JSON.parse(profileRaw) : { fullName: 'Student' };
  const results = JSON.parse(resultsRaw);
  const info = CATEGORY_INFO[results.topCat];

  // --- Hero text -----------------------------------------------------
  const firstName = profile.fullName.split(' ')[0] || 'there';
  document.getElementById('studentLine').textContent =
    `${firstName.toUpperCase()}'S ROUTE` + (results.timedOut ? ' · TIME EXPIRED, AUTO-SUBMITTED' : '');
  document.getElementById('topCatName').textContent = info.name;
  document.getElementById('topCatDesc').textContent = info.desc;

// --- Score breakdown bars -------------------------------------------
  const breakdown = document.getElementById('scoreBreakdown');
  const order = Object.keys(results.percentages).sort((a, b) => results.percentages[b] - results.percentages[a]);
  const pendingBarAnimations = []; // one start-the-animation function per row, run later via onPageReady

  order.forEach((cat) => {
    const pct = results.percentages[cat];
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
      <span class="cat-label">${CATEGORY_INFO[cat].name}</span>
      <span class="score-bar-track" ><div class="score-bar-fill" style="background: var(${CATEGORY_INFO[cat].cssVar});"></div></span>
      <span class="score-val">${pct}%</span>
    `;
    breakdown.appendChild(row);

    const fillEl = row.querySelector('.score-bar-fill');
    const valEl = row.querySelector('.score-val');
    fillEl.style.setProperty('--target-w', `${pct}%`);

    
    // Build the row and set its target width right away (cheap, and it
    // means the layout is already correct even before anything animates)
    // — but don't *start* the growth animation yet. That happens later,
    // once we know the preloader is actually gone.
      pendingBarAnimations.push(() => { 
      requestAnimationFrame(() => { fillEl.classList.add('fill-in'); });
     

      // Count the percentage text up from 0 → pct over the same ~1s window.
      const countStart = performance.now();
      const countDuration = 1000;
      function tickCount(now) {
        const t = Math.min(1, (now - countStart) / countDuration);
        const eased = 1 - Math.pow(1 - t, 3);
        valEl.textContent = `${Math.round(pct * eased)}%`;
        if (t < 1) requestAnimationFrame(tickCount);
      }
      requestAnimationFrame(tickCount);
    });
  });

  // --- Next steps -------------------------------------------------------
  const stepsList = document.getElementById('nextSteps');
  info.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span>${step}</span>`;
    stepsList.appendChild(li);
  });

  // --- Go further: roadmap + curated video links for the top match ---
  const goFurther = document.getElementById('goFurther');
  info.goFurther.forEach((item) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'go-further-card';
    a.innerHTML = `
      <span>
        <span class="gf-title">${item.title}</span><br>
        <span class="gf-sub">${item.sub}</span>
      </span>
      <span class="gf-arrow" aria-hidden="true">↗</span>
    `;
    goFurther.appendChild(a);
  });

  // --- Canvas chart (radar / bar toggle) -----------------------------
  const canvas = document.getElementById('resultsCanvas');
  const tabRadar = document.getElementById('tabRadar');
  const tabBar = document.getElementById('tabBar');

  // Rebuilt fresh on every render (cheap — 4 items) so a resolved colour
  // from a previous draw, or a theme change, never leaks into the next one.
  function buildAxes() {
    return Object.keys(results.percentages).map((cat) => ({
      label: CATEGORY_INFO[cat].name.split(' ')[0],
      value: results.percentages[cat],
      color: CATEGORY_INFO[cat].cssVar,
    }));
  }

  function renderChart(kind) {
    if (kind === 'bar') drawBarChart(canvas, buildAxes());
    else drawRadarChart(canvas, buildAxes());
  }

  tabRadar.addEventListener('click', () => {
    tabRadar.classList.add('active'); tabBar.classList.remove('active');
    renderChart('radar'); // user-triggered — fine to run immediately, no gating needed
  });
  tabBar.addEventListener('click', () => {
    tabBar.classList.add('active'); tabRadar.classList.remove('active');
    renderChart('bar');
  });

  // --- Marquee: append this run to the on-device feed, then render ---
  const feed = updateCompletionFeed({ name: `${firstName} ${profile.fullName.split(' ').slice(-1)[0]?.[0] || ''}.`, cat: results.topCat });
  renderMarquee(feed);

  // --- Fire every entrance animation together, once the page is
  // actually visible: the score bars, their percentage counters, the
  // chart's initial draw-in, and the confetti burst. Grouping them here
  // (rather than each finding its own way to delay itself) keeps the
  // "wait for the preloader" logic in one obvious place.
  onPageReady(() => {
    pendingBarAnimations.forEach((run) => run());
    renderChart('radar');

    setTimeout(() => {
      if (typeof fireConfetti === 'function') {
        const burstColors = Object.values(CATEGORY_INFO).map((c) =>
          getComputedStyle(document.documentElement).getPropertyValue(c.cssVar).trim()
        );
        fireConfetti(burstColors);
      }
    }, 400); // small extra pause so it doesn't collide visually with the reveal
  });
})();