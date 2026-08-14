# Learning Journey Plan — BSE Specialisation Advisor

A vanilla HTML5 / CSS3 / JavaScript (ES6+) web app that helps incoming
students find their best-fit BSE specialisation — **Low-Level Programming**,
**AR/VR**, **Full-Stack Web Development**, or **Machine Learning** — through
a short, timed, scored quiz with an animated Canvas results chart.


## Project structure

```
├── index.html          Landing page + student intake form (regex validation)
├── quiz.html            Timed, 10-question quiz shell
├── results.html          Results page + Canvas radar chart and bar graph mount
├── contact.html          Contact & feedback page + validated form
├── css/style.css         Design tokens, layout, form states, animations, dark/light theme
├── js/
│   ├── validation.js      Shared regex + inline-validation engine
│   ├── landing.js         Intake form wiring
│   ├── quiz.js            Question bank, timer, scoring engine, rendering
│   ├── canvas-chart.js    Pure Canvas 2D radar + bar charts (no chart libraries)
│   ├── confetti.js        Pure Canvas 2D confetti burst
│   ├── preloader.js       Splash-screen controller
│   ├── nav.js             Hamburger menu + scroll-reveal
│   ├── theme.js           Dark/light toggle (persisted in localStorage)
│   ├── results.js         Reads quiz output, renders feedback, chart, marquee, go-further links
│   └── contact.js         Contact form wiring
└── assets/
    ├── audio/              Synthesised audio prompt (WAV + MP3 fallback)
    └── video/              Synthesised scenario clip for the video question
```

## Features you will be interacting with

🚀The preloader that appears only when a page is been downloaded and dismissed there after

🚀A hamburger button that only appears on smaller screens

🚀A theme toggle for switching between light and dark modes

🚀A glow cursor for boosting user experience

🚀Magnetic buttons

🚀A marquee animation for displaying recently completed allocations to various fields

🚀A scroll progress bar for showing users how far the've travelled down a page

🚀A confetti celebration engine that comes into action after successfully completing a quiz and been assigned to a module

🚀A canvas chart that exists through out all the pages for making the pages appealing

🚀A radar chart and a bar chart button for displaying the results of the quiz based on which button has been selected.

🚀A contact form for reaching out to the author with a robust validation  check.







## Data flow

`index.html` → saves profile to `sessionStorage['ljp_profile']` →
`quiz.html` → saves scored results to `sessionStorage['ljp_results']` →
`results.html` reads both to render the personalised outcome.


