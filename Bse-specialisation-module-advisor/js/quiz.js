/* 
   quiz.js
   Renders a mixed-type quiz (multiple choice / image hotspot / audio),
   runs a countdown timer with clearInterval-based cleanup, and scores
   answers into four specialisation categories with streak + speed bonuses.
   */

/* --------------------------------------------------------------------------
   1. QUESTION BANK
   Each question maps its answer(s) to one of four categories:
   LL = Low-Level Programming, AR = AR/VR, FS = Full-Stack, ML = Machine Learning
   -------------------------------------------------------------------------- */
const QUESTIONS = [
  {
    id: 'q1', type: 'choice',
    prompt: 'A project is due tomorrow and something is badly broken. What do you reach for first?',
    options: [
      { key: 'A', text: 'A debugger and the call stack — I want to see exactly what the CPU is doing.', cat: 'LL' },
      { key: 'B', text: 'The browser console and network tab — I want to see what the user sees.', cat: 'FS' },
      { key: 'C', text: 'The dataset — maybe the model is the problem, not the code.', cat: 'ML' },
      { key: 'D', text: 'A pen and paper — I want to sketch the interaction before touching code.', cat: 'AR' },
    ],
  },
  {
    id: 'q2', type: 'choice',
    prompt: 'Pick the sentence that sounds most like you.',
    options: [
      { key: 'A', text: '"I want to know why this is slow, down to the instruction."', cat: 'LL' },
      { key: 'B', text: '"I want people to feel like they\'re somewhere else entirely."', cat: 'AR' },
      { key: 'C', text: '"I want to ship a feature users actually notice."', cat: 'FS' },
      { key: 'D', text: '"I want the system to get smarter the more data it sees."', cat: 'ML' },
    ],
  },
  {
    id: 'q3', type: 'choice',
    prompt: 'Which weekend project sounds most fun, honestly?',
    options: [
      { key: 'A', text: 'Writing a tiny operating system kernel from scratch.', cat: 'LL' },
      { key: 'B', text: 'Building a 3D scene you can walk through with a headset.', cat: 'AR' },
      { key: 'C', text: 'Cloning your favourite app, front-end and back-end.', cat: 'FS' },
      { key: 'D', text: 'Training a model to recognise your own handwriting.', cat: 'ML' },
    ],
  },
  {
    id: 'q4', type: 'choice',
    prompt: 'What frustrates you most in a bad piece of software?',
    options: [
      { key: 'A', text: 'It wastes memory and CPU cycles for no reason.', cat: 'LL' },
      { key: 'B', text: 'It feels flat — no depth, no sense of space.', cat: 'AR' },
      { key: 'C', text: 'The interface is clunky and slow to use.', cat: 'FS' },
      { key: 'D', text: 'It makes the same dumb mistake over and over instead of learning.', cat: 'ML' },
    ],
  },
  {
    id: 'q5', type: 'choice',
    prompt: 'Which class would you actually look forward to?',
    options: [
      { key: 'A', text: 'Computer Architecture & Assembly', cat: 'LL' },
      { key: 'B', text: '3D Graphics & Spatial Computing', cat: 'AR' },
      { key: 'C', text: 'Web Frameworks & Databases', cat: 'FS' },
      { key: 'D', text: 'Statistics & Neural Networks', cat: 'ML' },
    ],
  },
  {
    id: 'q6', type: 'hotspot',
    prompt: 'Click the corner of this workbench that you\'d want to spend the most time at.',
    // zones handled by renderer directly
  },
  {
    id: 'q7', type: 'audio',
    prompt: 'Press play. Which description matches the rhythm you just heard?',
    options: [
      { key: 'A', text: 'Precise and metronomic — I like counting exactly what happens each beat.', cat: 'LL' },
      { key: 'B', text: 'It felt like it filled the whole room around me.', cat: 'AR' },
      { key: 'C', text: 'Fast and iterative — reminds me of quick build-test-ship cycles.', cat: 'FS' },
      { key: 'D', text: 'It kept adjusting itself — every beat refined the last one.', cat: 'ML' },
    ],
  },
  {
    id: 'q8', type: 'choice',
    prompt: 'Your ideal teammate compliments you by saying...',
    options: [
      { key: 'A', text: '"You found the bug three layers below where anyone else looked."', cat: 'LL' },
      { key: 'B', text: '"That demo made people gasp."', cat: 'AR' },
      { key: 'C', text: '"You shipped the whole feature in a day."', cat: 'FS' },
      { key: 'D', text: '"Your model\'s accuracy jumped 10 points overnight."', cat: 'ML' },
    ],
  },
  {
    id: 'q9', type: 'choice',
    prompt: 'Pick the tool you\'re most curious to get good at.',
    options: [
      { key: 'A', text: 'A systems-level language like C or Rust.', cat: 'LL' },
      { key: 'B', text: 'A 3D engine like Unity or Unreal.', cat: 'AR' },
      { key: 'C', text: 'A full-stack framework like React + Node.', cat: 'FS' },
      { key: 'D', text: 'A ML framework like PyTorch or TensorFlow.', cat: 'ML' },
    ],
  },
  {
    id: 'q10', type: 'video',
    prompt: 'Watch the short scenario below. It will pause partway through and ask you to decide.',
    pauseAt: 9,   // seconds — where playback auto-pauses via a timeupdate listener
    options: [
      { key: 'A', text: 'The one where I profile and optimise a slow rendering pipeline.', cat: 'LL' },
      { key: 'B', text: 'The one prototyping a walkable 3D showroom.', cat: 'AR' },
      { key: 'C', text: 'The one building the customer-facing web dashboard.', cat: 'FS' },
      { key: 'D', text: 'The one predicting demand from last quarter\'s data.', cat: 'ML' },
    ],
  },
];

const CATEGORY_META = {
  LL: { name: 'Low-Level Programming', color: '--cat-lowlevel' },
  AR: { name: 'AR / VR', color: '--cat-arvr' },
  FS: { name: 'Full-Stack Web Development', color: '--cat-fullstack' },
  ML: { name: 'Machine Learning', color: '--cat-ml' },
};

/* --------------------------------------------------------------------------
   2. STATE
   -------------------------------------------------------------------------- */
const state = {
  index: 0,
  answers: {},            // { questionId: { cat, tookMs } }
  scores: { LL: 0, AR: 0, FS: 0, ML: 0 },
  streakCat: null,
  streakCount: 0,
  questionStartedAt: null,
  timeLeft: 300,          // seconds — 5:00 total for the whole quiz
  timerId: null,
  locked: false,
  started: false,         // gate — the quiz (and its timer) only begins once the student opts in
};

/* --------------------------------------------------------------------------
   3. DOM REFERENCES
   -------------------------------------------------------------------------- */
const mount = document.getElementById('quizMount');
const routeProgress = document.getElementById('routeProgress');
const timerBadge = document.getElementById('timerBadge');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const liveRegion = document.getElementById('quizLiveRegion');
const audioEl = document.getElementById('quizAudio');

/* --------------------------------------------------------------------------
   4. TIMER ENGINE (setInterval / clearInterval)
   -------------------------------------------------------------------------- */
function startTimer() {
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    renderTimer();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      handleTimeout();
    }
  }, 1000);
}

function renderTimer() {
  const m = Math.floor(state.timeLeft / 60).toString().padStart(2, '0');
  const s = (state.timeLeft % 60).toString().padStart(2, '0');
  timerBadge.textContent = `${m}:${s}`;
  timerBadge.classList.toggle('warning', state.timeLeft <= 30 && state.timeLeft > 0);
}

function handleTimeout() {
  state.locked = true;
  mount.parentElement.querySelector('.quiz-actions').classList.add('quiz-locked');
  document.getElementById('quizMount').classList.add('quiz-locked');
  liveRegion.textContent = 'Time is up. Your quiz has been locked and submitted automatically.';
  finishQuiz(true);
}

/* --------------------------------------------------------------------------
   5. SCORING ENGINE
   Speed bonus: answering within 6s of the question appearing adds +0.5.
   Streak multiplier: 3+ consecutive answers in the same category multiply
   that pick's points by 1.5 (rewards a clear, consistent profile).
   -------------------------------------------------------------------------- */
function recordAnswer(questionId, cat) {
  const tookMs = Date.now() - state.questionStartedAt;
  state.answers[questionId] = { cat, tookMs };

  let points = 1;
  if (tookMs <= 6000) points += 0.5; // speed bonus

  if (state.streakCat === cat) {
    state.streakCount += 1;
  } else {
    state.streakCat = cat;
    state.streakCount = 1;
  }
  if (state.streakCount >= 3) points *= 1.5; // streak multiplier

  state.scores[cat] += points;
}

/* --------------------------------------------------------------------------
   6. START GATE
   The quiz used to render its first question (and start the timer) only 
   when the user clicks the "Start the quiz" button. This gives them a chance to 
   read the instructions and understand the time limit before committing.
   -------------------------------------------------------------------------- */
function renderStartGate() {
  document.querySelector('.quiz-topbar').style.visibility = 'hidden';
  document.querySelector('.quiz-actions').style.display = 'none';

  mount.innerHTML = `
    <div class="start-gate">
      <div class="start-icon" aria-hidden="true">▶</div>
      <h2>Ready when you are.</h2>
      <p>${QUESTIONS.length} questions · about 5 minutes on the clock once you begin.</p>
      <ul class="rules">
        <li>The countdown starts the moment you press Start — not before.</li>
        <li>Three questions use interactive media: an image you click, an audio cue you play, and a short video that pauses for your decision.</li>
        <li>If time runs out, your current answers are locked in automatically.</li>
      </ul>
      <button class="btn btn-primary" id="beginBtn" type="button">Start the quiz →</button>
    </div>
  `;

  document.getElementById('beginBtn').addEventListener('click', () => {
    state.started = true;
    document.querySelector('.quiz-topbar').style.visibility = 'visible';
    document.querySelector('.quiz-actions').style.display = 'flex';
    renderTimer();
    renderQuestion();
    startTimer();
  });
}

/* --------------------------------------------------------------------------
   7. RENDERING
   -------------------------------------------------------------------------- */
function renderProgress() {
  routeProgress.innerHTML = '';
  QUESTIONS.forEach((q, i) => {
    const dot = document.createElement('span');
    dot.className = 'stop';
    if (i < state.index) dot.classList.add('done');
    if (i === state.index) dot.classList.add('current');
    routeProgress.appendChild(dot);
  });
}

function renderQuestion() {
  const q = QUESTIONS[state.index];
  state.questionStartedAt = Date.now();
  mount.innerHTML = '';

  const idx = document.createElement('div');
  idx.className = 'q-index';
  idx.textContent = `QUESTION ${state.index + 1} / ${QUESTIONS.length}`;
  mount.appendChild(idx);

  const h2 = document.createElement('h2');
  h2.textContent = q.prompt;
  mount.appendChild(h2);

  if (q.type === 'choice' || q.type === 'audio') {
    if (q.type === 'audio') mount.appendChild(buildAudioControls());
    mount.appendChild(buildOptionList(q));
  } else if (q.type === 'hotspot') {
    mount.appendChild(buildHotspot(q));
  } else if (q.type === 'video') {
    mount.appendChild(buildVideoQuestion(q));
  }

  renderProgress();
  updateNavButtons();
}

/** Multiple-choice / audio-choice option list. */
function buildOptionList(q) {
  const wrap = document.createElement('div');
  wrap.className = 'option-list';
  wrap.setAttribute('role', 'radiogroup');

  const existing = state.answers[q.id]?.cat;

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-card';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(opt.cat === existing));
    if (opt.cat === existing) btn.classList.add('selected');

    const key = document.createElement('span');
    key.className = 'opt-key';
    key.textContent = opt.key;
    btn.appendChild(key);

    const label = document.createElement('span');
    label.textContent = opt.text;
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      if (state.locked) return;
      // Only record scoring the first time this question is answered;
      // re-clicking just changes the visible selection + navigation state.
      const alreadyAnswered = !!state.answers[q.id];
      if (!alreadyAnswered) recordAnswer(q.id, opt.cat);
      else state.answers[q.id].cat = opt.cat; // change of mind, no new bonus

      wrap.querySelectorAll('.option-card').forEach((b) => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      updateNavButtons();
    });

    wrap.appendChild(btn);
  });

  return wrap;
}

/**
  Audio player with custom play / pause / replay controls (no native UI).
 */
function buildAudioControls() {
  const panel = document.createElement('div');
  panel.className = 'audio-panel';

  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'audio-btn';
  playBtn.setAttribute('aria-label', 'Play audio cue');
  playBtn.textContent = '▶';

  const replayBtn = document.createElement('button');
  replayBtn.type = 'button';
  replayBtn.className = 'audio-btn';
  replayBtn.setAttribute('aria-label', 'Replay audio cue');
  replayBtn.textContent = '⟲';

  const track = document.createElement('div');
  track.className = 'audio-progress-track';
  const fill = document.createElement('div');
  fill.className = 'audio-progress-fill';
  track.appendChild(fill);

  panel.append(playBtn, replayBtn, track);

  const status = document.createElement('p');
  status.className = 'audio-status';
  status.textContent = 'Press play to hear the rhythm (turn your volume up).';

  // Reset playback state for a clean start every time this question mounts.
  audioEl.pause();
  audioEl.currentTime = 0;
  audioEl.volume = 1;

  // Remove any listeners left over from a previous mount of this question
  // (navigating Back and Next again would otherwise stack duplicates).
  if (audioEl._ljpCleanup) audioEl._ljpCleanup();

  const onPlay = () => { playBtn.textContent = '❚❚'; status.textContent = 'Playing…'; status.classList.remove('error'); };
  const onPause = () => { if (!audioEl.ended) { playBtn.textContent = '▶'; status.textContent = 'Paused.'; } };
  const onEnded = () => { playBtn.textContent = '▶'; status.textContent = 'Finished — replay any time, or pick an answer below.'; status.classList.add('ready'); };
  const onTime = () => { if (audioEl.duration) fill.style.width = `${(audioEl.currentTime / audioEl.duration) * 100}%`; };
  const onError = () => {
    status.textContent = 'Audio couldn\'t load in this browser. You can still answer from the description below: a rhythm of beeps that starts slow and speeds up.';
    status.classList.add('error');
    playBtn.disabled = true;
    replayBtn.disabled = true;
  };
  const onCanPlay = () => { if (!status.classList.contains('error')) status.textContent = 'Ready — press play.'; };

  audioEl.addEventListener('play', onPlay);
  audioEl.addEventListener('pause', onPause);
  audioEl.addEventListener('ended', onEnded);
  audioEl.addEventListener('timeupdate', onTime);
  audioEl.addEventListener('error', onError);
  audioEl.addEventListener('canplaythrough', onCanPlay);

  audioEl._ljpCleanup = () => {
    audioEl.removeEventListener('play', onPlay);
    audioEl.removeEventListener('pause', onPause);
    audioEl.removeEventListener('ended', onEnded);
    audioEl.removeEventListener('timeupdate', onTime);
    audioEl.removeEventListener('error', onError);
    audioEl.removeEventListener('canplaythrough', onCanPlay);
  };

  function attemptPlay() {
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => {
        status.textContent = 'Playback was blocked by the browser. Click play again, or check your device isn\'t muted.';
        status.classList.add('error');
      });
    }
  }

  playBtn.addEventListener('click', () => {
    if (audioEl.paused) attemptPlay(); else audioEl.pause();
  });
  replayBtn.addEventListener('click', () => {
    audioEl.currentTime = 0;
    attemptPlay();
  });

  // If the file is already known-bad from an earlier load, reflect that now.
  if (audioEl.error) onError();

  const container = document.createElement('div');
  container.append(panel, status);
  return container;
}

/**
 * Image-hotspot question rendered as an inline SVG "workbench" scene with
 * four clickable overlay zones (per the brief's "SVG overlays" option).
 */
function buildHotspot(q) {
  const wrap = document.createElement('div');
  wrap.className = 'hotspot-wrap';

  const existing = state.answers[q.id]?.cat;

  wrap.innerHTML = `
    <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A workbench with four zones: circuit board, VR headset, laptop, and data nodes">
      <rect width="600" height="340" fill="#111b30"/>
      <!-- guide grid -->
      <g stroke="#2c4a75" stroke-width="1" opacity="0.4">
        <line x1="300" y1="0" x2="300" y2="340"/>
        <line x1="0" y1="170" x2="600" y2="170"/>
      </g>

      <!-- LL: circuit board icon, top-left -->
      <g>
        <rect x="40" y="30" width="90" height="70" rx="4" fill="none" stroke="#e8a04c" stroke-width="2"/>
        <circle cx="55" cy="45" r="3" fill="#e8a04c"/><circle cx="75" cy="45" r="3" fill="#e8a04c"/>
        <circle cx="95" cy="45" r="3" fill="#e8a04c"/><circle cx="115" cy="45" r="3" fill="#e8a04c"/>
        <path d="M55 45 V70 H115 V45" fill="none" stroke="#e8a04c" stroke-width="1.5"/>
        <text x="45" y="118" class="hotspot-label">CIRCUIT BOARD</text>
      </g>

      <!-- AR/VR: headset icon, top-right -->
      <g>
        <rect x="480" y="40" width="80" height="45" rx="16" fill="none" stroke="#9d7bf0" stroke-width="2"/>
        <circle cx="505" cy="62" r="8" fill="none" stroke="#9d7bf0" stroke-width="2"/>
        <circle cx="535" cy="62" r="8" fill="none" stroke="#9d7bf0" stroke-width="2"/>
        <text x="470" y="118" class="hotspot-label">VR HEADSET</text>
      </g>

      <!-- Full-Stack: laptop/browser icon, bottom-left -->
      <g>
        <rect x="45" y="210" width="100" height="65" rx="3" fill="none" stroke="#35c9b0" stroke-width="2"/>
        <line x1="45" y1="226" x2="145" y2="226" stroke="#35c9b0" stroke-width="1.5"/>
        <circle cx="55" cy="218" r="2" fill="#35c9b0"/>
        <text x="55" y="305" class="hotspot-label">BROWSER WINDOW</text>
      </g>

      <!-- ML: neural nodes icon, bottom-right -->
      <g>
        <circle cx="480" cy="220" r="5" fill="#ef6f8e"/>
        <circle cx="480" cy="250" r="5" fill="#ef6f8e"/>
        <circle cx="520" cy="235" r="5" fill="#ef6f8e"/>
        <circle cx="560" cy="220" r="5" fill="#ef6f8e"/>
        <circle cx="560" cy="250" r="5" fill="#ef6f8e"/>
        <g stroke="#ef6f8e" stroke-width="1">
          <line x1="480" y1="220" x2="520" y2="235"/><line x1="480" y1="250" x2="520" y2="235"/>
          <line x1="520" y1="235" x2="560" y2="220"/><line x1="520" y1="235" x2="560" y2="250"/>
        </g>
        <text x="470" y="305" class="hotspot-label">DATA NODES</text>
      </g>

      <!-- Clickable overlay zones -->
      <rect class="hotspot-zone" data-cat="LL" x="0" y="0" width="300" height="170" fill="#e8a04c"/>
      <rect class="hotspot-zone" data-cat="AR" x="300" y="0" width="300" height="170" fill="#9d7bf0"/>
      <rect class="hotspot-zone" data-cat="FS" x="0" y="170" width="300" height="170" fill="#35c9b0"/>
      <rect class="hotspot-zone" data-cat="ML" x="300" y="170" width="300" height="170" fill="#ef6f8e"/>
    </svg>
  `;

  wrap.querySelectorAll('.hotspot-zone').forEach((zone) => {
    if (zone.dataset.cat === existing) zone.classList.add('selected');
    zone.addEventListener('click', () => {
      if (state.locked) return;
      const alreadyAnswered = !!state.answers[q.id];
      if (!alreadyAnswered) recordAnswer(q.id, zone.dataset.cat);
      else state.answers[q.id].cat = zone.dataset.cat;

      wrap.querySelectorAll('.hotspot-zone').forEach((z) => z.classList.remove('selected'));
      zone.classList.add('selected');
      updateNavButtons();
    });
  });

  return wrap;
}

/**
 * Video-scenario question: an embedded HTML5 <video> that auto-pauses at a
 * pre-programmed timestamp (via a 'timeupdate' listener) and reveals an
 * option overlay the student must answer before the clip is allowed to
 * continue.
 */
function buildVideoQuestion(q) {
  const wrap = document.createElement('div');

  const videoWrap = document.createElement('div');
  videoWrap.className = 'video-wrap';

  const video = document.createElement('video');
  video.setAttribute('playsinline', '');
  video.controls = false; // fully custom-triggered — no native scrubbing past the checkpoint
  video.innerHTML = `
    <source src="assets/video/scenario_prompt.mp4" type="video/mp4">
  `;
  // Explicitly reload the source list. Some browsers don't reliably pick up
  // <source> children injected via innerHTML before the element is inserted
  // into the page — calling load() forces it to re-scan and start buffering.
  video.load();

  const overlay = document.createElement('div');
  overlay.className = 'video-pause-overlay';
  const optionList = buildOptionList(q); // reuses the same option-card renderer + scoring path
  overlay.appendChild(optionList);

  videoWrap.append(video, overlay);

  const status = document.createElement('p');
  status.className = 'video-status';
  status.textContent = 'Press play to begin the scenario.';

  const playRow = document.createElement('div');
  playRow.className = 'audio-panel';
  const playBtn = document.createElement('button');
  playBtn.type = 'button';
  playBtn.className = 'audio-btn';
  playBtn.setAttribute('aria-label', 'Play video');
  playBtn.textContent = '▶';
  playRow.appendChild(playBtn);

  wrap.append(videoWrap, playRow, status);

  const alreadyAnswered = !!state.answers[q.id];
  let hasPaused = alreadyAnswered; // if returning to an answered question, skip the gate

  function attemptPlay() {
    const p = video.play();
    if (p && p.catch) {
      p.catch((err) => {
        // Different failure reasons need different messages.
        // Logging the real error to the console is what makes this diagnosable at all.
        console.error('Video playback failed:', err.name, err.message);
        if (err.name === 'NotAllowedError') {
          status.textContent = 'Your browser blocked autoplay — click play again to start it manually.';
        } else if (err.name === 'NotSupportedError') {
          status.textContent = 'This browser can\'t play this video file. Try a different browser, or answer from the scenario description above.';
        } else {
          status.textContent = `Playback failed (${err.name || 'unknown error'}) — click play to retry.`;
        }
      });
    }
  }

  playBtn.addEventListener('click', () => {
    if (video.paused) attemptPlay(); else video.pause();
  });
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; status.textContent = 'Playing…'; });
  video.addEventListener('pause', () => { if (!video.ended) playBtn.textContent = '▶'; });
  video.addEventListener('ended',()=> {playBtn.textContent = '▶';status.textContent = 'video ended'})
  video.addEventListener('error', () => {
    // video.error.code maps to a small fixed set of standard reasons —
    // surfacing which one it is makes a dead video far easier to debug
    // than a single generic "something went wrong" message.
    const codes = {
      1: 'loading was aborted',
      2: 'a network error occurred',
      3: 'the file could not be decoded',
      4: 'this format/source isn\'t supported',
    };
    const reason = video.error ? (codes[video.error.code] || 'unknown reason') : 'unknown reason';
    console.error('Video element error:', reason, video.error);
    status.textContent = `Video couldn't load (${reason}) — you can still answer below based on the scenario description.`;
    overlay.classList.add('show');
  });

  video.addEventListener('timeupdate', () => {
    if (!hasPaused && video.currentTime >= q.pauseAt) {
      video.pause();
      hasPaused = true;
      overlay.classList.add('show');
      status.textContent = 'Paused for your decision — pick an option to continue.';
    }
  });

  // Once an option is chosen, resume playback automatically and let the
  // student move on without waiting for the outro to finish.
  optionList.addEventListener('click', (e) => {
    if (!e.target.closest('.option-card')) return;
    overlay.classList.remove('show');
    if (!video.ended && video.paused) attemptPlay();
    updateNavButtons();
  });

  if (alreadyAnswered) {
    // Returning student: show the clip ready to rewatch, answer already locked in.
    status.textContent = 'Answered — you can rewatch the clip or move on.';
  }

  return wrap;
}

function updateNavButtons() {
  prevBtn.disabled = state.index === 0;
  const q = QUESTIONS[state.index];
  const answered = !!state.answers[q.id];
  nextBtn.textContent = state.index === QUESTIONS.length - 1 ? 'See my results →' : 'Next →';
  nextBtn.disabled = !answered;
}

/* --------------------------------------------------------------------------
   7. NAVIGATION
   -------------------------------------------------------------------------- */
prevBtn.addEventListener('click', () => {
  if (state.index > 0) { state.index -= 1; renderQuestion(); }
});

nextBtn.addEventListener('click', () => {
  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    finishQuiz(false);
  }
});

/* --------------------------------------------------------------------------
   8. FINISH / HAND-OFF TO RESULTS PAGE
   -------------------------------------------------------------------------- */
function finishQuiz(timedOut) {
  clearInterval(state.timerId);
  const total = Object.values(state.scores).reduce((a, b) => a + b, 0) || 1;
  const percentages = {};
  Object.keys(state.scores).forEach((cat) => {
    percentages[cat] = Math.round((state.scores[cat] / total) * 100);
  });
  const topCat = Object.keys(state.scores).sort((a, b) => state.scores[b] - state.scores[a])[0];

  const payload = {
    scores: state.scores,
    percentages,
    topCat,
    answeredCount: Object.keys(state.answers).length,
    totalQuestions: QUESTIONS.length,
    timedOut,
    completedAt: new Date().toISOString(),
  };
  sessionStorage.setItem('ljp_results', JSON.stringify(payload));
  window.location.href = 'results.html';
}

/* --------------------------------------------------------------------------
   9. BOOTSTRAP
   -------------------------------------------------------------------------- */
(function init() {
  // Require a profile from the landing page; otherwise send them back.
  if (!sessionStorage.getItem('ljp_profile')) {
    window.location.href = 'index.html';
    return;
  }
  renderStartGate();
})();
