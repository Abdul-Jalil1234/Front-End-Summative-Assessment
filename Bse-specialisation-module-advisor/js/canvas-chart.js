/* 
   canvas-chart.js
   Draws a 4-axis "compass" radar chart on a <canvas> using only the
   standard 2D context API — no Chart.js or similar. Styled as a blueprint
   instrument: concentric rings, tick marks, and an animated amber trace
   that draws itself in over ~900ms (requestAnimationFrame).
    */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{label:string, value:number, color:string}[]} axes  value 0-100
 */
function drawRadarChart(canvas, axes) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2 - 10;
  const maxR = Math.min(w, h) / 2 - 70;
  const n = axes.length;
  const rings = 4; // concentric grid rings (25/50/75/100)

  // Pre-compute each axis's angle (start at top, clockwise)
  const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  function polar(r, angle) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(44, 74, 117, 0.9)';
    ctx.fillStyle = 'rgba(169, 184, 212, 0.9)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.lineWidth = 1;

    // concentric rings
    for (let ring = 1; ring <= rings; ring++) {
      const r = (maxR / rings) * ring;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const p = polar(r, angleFor(i % n));
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // spokes + axis labels
    axes.forEach((axis, i) => {
      const angle = angleFor(i);
      const edge = polar(maxR, angle);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(edge.x, edge.y);
      ctx.stroke();

      const labelPos = polar(maxR + 34, angle);
      ctx.textAlign = Math.cos(angle) > 0.3 ? 'left' : Math.cos(angle) < -0.3 ? 'right' : 'center';
      ctx.fillText(axis.label, labelPos.x, labelPos.y);
      ctx.fillStyle = 'var(--paper-dim)';
    });

    // ring value ticks along the top spoke
    ctx.fillStyle = 'rgba(169, 184, 212, 0.6)';
    ctx.textAlign = 'left';
    for (let ring = 1; ring <= rings; ring++) {
      const val = Math.round((100 / rings) * ring);
      const p = polar((maxR / rings) * ring, angleFor(0));
      ctx.fillText(String(val), p.x + 4, p.y - 2);
    }
    ctx.restore();
  }

  function drawTrace(progress) {
    // progress: 0..1, animates the polygon "growing" outward from centre
    ctx.save();
    ctx.beginPath();
    axes.forEach((axis, i) => {
      const r = (axis.value / 100) * maxR * progress;
      const p = polar(r, angleFor(i));
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(232, 160, 76, 0.18)';
    ctx.strokeStyle = '#e8a04c';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // vertex dots, colour-coded per category
    axes.forEach((axis, i) => {
      const r = (axis.value / 100) * maxR * progress;
      const p = polar(r, angleFor(i));
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = axis.color;
      ctx.fill();
      ctx.strokeStyle = '#0b1220';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  // Resolve CSS custom-property colours (canvas can't read var() directly)
  const rootStyles = getComputedStyle(document.documentElement);
  axes.forEach((a) => {
    if (a.color.startsWith('--')) a.color = rootStyles.getPropertyValue(a.color).trim();
  });

  let start = null;
  const duration = 900;

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(1, elapsed / duration);
    // ease-out cubic for a natural "settle" feel
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, w, h);
    drawGrid();
    drawTrace(eased);

    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.drawRadarChart = drawRadarChart;

/* 
   drawBarChart
   A second, equally hand-rolled Canvas 2D view of the same score data —
   lets the student compare their profile as a radar OR a bar graph via
   the tabs on the results page. Bars grow in with the same eased
   requestAnimationFrame approach as the radar trace.
    */
function drawBarChart(canvas, axes) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rootStyles = getComputedStyle(document.documentElement);

  axes.forEach((a) => {
    if (a.color.startsWith('--')) a.color = rootStyles.getPropertyValue(a.color).trim();
  });

  const paddingLeft = 46, paddingRight = 20, paddingTop = 24, paddingBottom = 54;
  const plotW = w - paddingLeft - paddingRight;
  const plotH = h - paddingTop - paddingBottom;
  const gap = 28;
  const barW = (plotW - gap * (axes.length - 1)) / axes.length;

  function drawAxesAndGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(44, 74, 117, 0.9)';
    ctx.fillStyle = 'rgba(169, 184, 212, 0.85)';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.lineWidth = 1;

    // horizontal gridlines at 0/25/50/75/100%
    for (let i = 0; i <= 4; i++) {
      const val = i * 25;
      const y = paddingTop + plotH - (val / 100) * plotH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - paddingRight, y);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(`${val}`, paddingLeft - 8, y + 3);
    }

    // baseline
    ctx.strokeStyle = 'rgba(169, 184, 212, 0.6)';
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + plotH);
    ctx.lineTo(w - paddingRight, paddingTop + plotH);
    ctx.stroke();
    ctx.restore();
  }

  function drawBars(progress) {
    ctx.save();
    axes.forEach((axis, i) => {
      const x = paddingLeft + i * (barW + gap);
      const targetH = (axis.value / 100) * plotH;
      const barH = targetH * progress;
      const y = paddingTop + plotH - barH;

      // bar
      ctx.fillStyle = axis.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, barW, barH);
      ctx.globalAlpha = 1;

      // outline
      ctx.strokeStyle = axis.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, barW, barH);

      // value label above the bar
      if (progress > 0.85) {
        ctx.fillStyle = 'var(--paper)';
        ctx.fillStyle = '#eef3fb';
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(axis.value)}%`, x + barW / 2, y - 8);
      }

      // wrapped category label under each bar
      ctx.fillStyle = 'rgba(169, 184, 212, 0.9)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const words = axis.label.split(' ');
      words.forEach((word, wi) => {
        ctx.fillText(word, x + barW / 2, paddingTop + plotH + 18 + wi * 13);
      });
    });
    ctx.restore();
  }

  let start = null;
  const duration = 800;
  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, w, h);
    drawAxesAndGrid();
    drawBars(eased);

    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

window.drawBarChart = drawBarChart;
