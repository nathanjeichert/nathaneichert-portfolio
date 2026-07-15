// DOM helpers, toasts, and the app's small inline-SVG visuals
// (progress ring, activity bars, grade sparkline). Single-series marks in the
// app accent; text always in ink tokens, never the mark color.

/** Hyperscript-ish element builder. h('div.card', {onclick}, child, ...) */
export function h(tag, attrs, ...children) {
  const [name, ...classes] = tag.split('.');
  const el = document.createElement(name || 'div');
  if (classes.length) el.className = classes.join(' ');
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className += (el.className ? ' ' : '') + v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k in el && k !== 'type' && k !== 'value') { try { el[k] = v; } catch { el.setAttribute(k, v); } }
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

// --- toasts ---
let toastHost = null;
export function toast(msg, { action, actionLabel, duration = 3200, sticky = false } = {}) {
  if (!toastHost) { toastHost = h('div.toast-host'); document.body.append(toastHost); }
  const t = h('div.toast', {},
    h('span', {}, msg),
    action ? h('button.toast-action', { onclick: () => { action(); t.remove(); } }, actionLabel || 'OK') : null,
  );
  toastHost.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  if (!sticky) setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, duration);
  return t;
}

// --- confirm dialog (keyboard friendly) ---
export function confirmDialog(message, { yes = 'Confirm', no = 'Cancel', danger = false } = {}) {
  return new Promise(resolve => {
    const done = v => { overlay.remove(); resolve(v); };
    const overlay = h('div.overlay', { onclick: e => { if (e.target === overlay) done(false); } },
      h('div.dialog', { role: 'dialog' },
        h('p', {}, message),
        h('div.dialog-row', {},
          h('button.btn', { onclick: () => done(false) }, no),
          h('button.btn' + (danger ? '.btn-danger' : '.btn-primary'), { onclick: () => done(true) }, yes),
        ),
      ),
    );
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); done(false); }
      if (e.key === 'Enter') { e.stopPropagation(); done(true); }
    });
    document.body.append(overlay);
    overlay.focus();
  });
}

// --- formatting ---
export function fmtDue(due, now = Date.now()) {
  const d = due - now;
  if (d <= 0) return 'due now';
  if (d < 3600000) return 'in ' + Math.max(1, Math.round(d / 60000)) + 'm';
  if (d < 86400000) return 'in ' + Math.round(d / 3600000) + 'h';
  return 'in ' + Math.round(d / 86400000) + 'd';
}

export function fmtAgo(ts, now = Date.now()) {
  const d = now - ts;
  if (d < 3600000) return Math.max(1, Math.round(d / 60000)) + 'm ago';
  if (d < 86400000) return Math.round(d / 3600000) + 'h ago';
  return Math.round(d / 86400000) + 'd ago';
}

export function fmtDuration(ms) {
  const m = Math.floor(ms / 60000), s = Math.round((ms % 60000) / 1000);
  return m ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export const tierChip = (tier) => h('span.chip.tier-' + tier.toLowerCase(), {}, tier);

export function gradeDot(g) {
  const cls = g <= 3 ? 'g-low' : g <= 6 ? 'g-mid' : 'g-high';
  return h('span.grade-dot.' + cls, { title: 'grade ' + g }, String(g));
}

// --- inline SVG visuals ---
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(name, attrs) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  return el;
}

/** Progress ring: pct 0-1, label rendered in HTML next to it (not inside). */
export function ring(pct, size = 96, stroke = 8) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, class: 'ring', role: 'img', 'aria-label': Math.round(pct * 100) + '% complete' });
  svg.append(svgEl('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--ring-track)', 'stroke-width': stroke }));
  svg.append(svgEl('circle', {
    cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--accent)', 'stroke-width': stroke,
    'stroke-linecap': 'round', 'stroke-dasharray': c,
    'stroke-dashoffset': c * (1 - Math.max(0, Math.min(1, pct))),
    transform: `rotate(-90 ${size / 2} ${size / 2})`, class: 'ring-fill',
  }));
  const label = svgEl('text', { x: '50%', y: '50%', dy: '0.36em', 'text-anchor': 'middle', class: 'ring-label' });
  label.textContent = Math.round(pct * 100) + '%';
  svg.append(label);
  return svg;
}

/**
 * Daily activity bars (single series). values: [{label, value, hint}], goal line optional.
 * Thin rounded-top bars, 2px gaps, hover tooltip via <title>.
 */
export function bars(values, { width = 320, height = 72, goal = null } = {}) {
  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, class: 'bars', role: 'img', 'aria-label': 'daily activity' });
  const max = Math.max(goal || 0, ...values.map(v => v.value), 1);
  const n = values.length;
  const gap = 2;
  const bw = Math.max(2, (width - gap * (n - 1)) / n);
  values.forEach((v, i) => {
    const bh = Math.max(v.value > 0 ? 3 : 1, (v.value / max) * (height - 14));
    const x = i * (bw + gap);
    const rect = svgEl('rect', {
      x, y: height - 12 - bh, width: bw, height: bh, rx: 2,
      fill: v.value > 0 ? 'var(--accent)' : 'var(--ring-track)',
      class: 'bar',
    });
    const title = svgEl('title', {});
    title.textContent = `${v.label}: ${v.value}`;
    rect.append(title);
    svg.append(rect);
  });
  if (goal) {
    const gy = height - 12 - (goal / max) * (height - 14);
    svg.append(svgEl('line', { x1: 0, x2: width, y1: gy, y2: gy, stroke: 'var(--muted)', 'stroke-dasharray': '3 3', 'stroke-width': 1 }));
  }
  return svg;
}

/** Grade history sparkline: 1-9 mapped to height, 2px line, dots >= 4px. */
export function sparkline(grades, { width = 140, height = 36 } = {}) {
  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, class: 'spark', role: 'img', 'aria-label': 'grade history' });
  if (!grades.length) return svg;
  const pad = 4;
  const xs = grades.length === 1
    ? [width / 2]
    : grades.map((_, i) => pad + (i * (width - 2 * pad)) / (grades.length - 1));
  const y = g => height - pad - ((g - 1) / 8) * (height - 2 * pad);
  if (grades.length > 1) {
    const d = grades.map((g, i) => (i ? 'L' : 'M') + xs[i].toFixed(1) + ' ' + y(g).toFixed(1)).join(' ');
    svg.append(svgEl('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  }
  grades.forEach((g, i) => {
    const dot = svgEl('circle', { cx: xs[i], cy: y(g), r: 3, fill: g <= 3 ? 'var(--bad)' : g <= 6 ? 'var(--warn)' : 'var(--good)', stroke: 'var(--surface)', 'stroke-width': 1.5 });
    const t = svgEl('title', {}); t.textContent = 'grade ' + g; dot.append(t);
    svg.append(dot);
  });
  return svg;
}

/** Attach horizontal swipe handlers (mobile intro/browse navigation). */
export function onSwipe(el, { left, right, threshold = 48 } = {}) {
  let x0 = null, y0 = null;
  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    const dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > threshold && Math.abs(dx) > 1.8 * Math.abs(dy)) {
      if (dx < 0 && left) left(); else if (dx > 0 && right) right();
    }
  }, { passive: true });
}

/** Download a text file. */
export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 500);
}
