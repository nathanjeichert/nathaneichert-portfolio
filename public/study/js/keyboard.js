// Global keyboard dispatch. The active view registers a handler; `?` opens the
// shortcut overlay from anywhere. Keys are ignored while typing in inputs.

import { h } from './ui.js';

let viewHandler = null;

/** The active view sets (and clears) its key handler. Return true = handled. */
export function setKeyHandler(fn) { viewHandler = fn; }

const SHORTCUTS = [
  ['Space', 'Reveal answer / next (intro)'],
  ['1–9', 'Grade the card (1-3 fail · 4-6 partial · 7-9 clean)'],
  ['H', 'Hint ladder: bare skeleton, then guided'],
  ['U', 'Undo last grade'],
  ['T', 'Re-tier card (T1 → T2 → T3)'],
  ['D', 'Flag card for deletion'],
  ['← →', 'Navigate (intro / browse)'],
  ['Enter', 'Start / next session'],
  ['Esc', 'Back / close'],
  ['G then key', 'Go: H home · D drill · I intro · B browse · S stats · O settings'],
  ['?', 'This overlay'],
];

let overlay = null;
export function toggleShortcutOverlay(force) {
  const show = force !== undefined ? force : !overlay;
  if (!show) { overlay?.remove(); overlay = null; return; }
  overlay = h('div.overlay', { onclick: e => { if (e.target === overlay) toggleShortcutOverlay(false); } },
    h('div.dialog.shortcuts', {},
      h('h2', {}, 'Keyboard shortcuts'),
      h('table', {}, SHORTCUTS.map(([k, desc]) =>
        h('tr', {}, h('td', {}, h('kbd', {}, k)), h('td', {}, desc)))),
      h('p.dim', {}, 'Press ? or Esc to close'),
    ),
  );
  document.body.append(overlay);
}

let goMode = false;
let goTimer = null;

export function initKeyboard(navigate) {
  document.addEventListener('keydown', e => {
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) {
      if (e.key === 'Escape') el.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === '?') { e.preventDefault(); toggleShortcutOverlay(); return; }
    if (overlay) {
      if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); toggleShortcutOverlay(false); }
      return;
    }

    // "g"-prefix quick navigation
    if (goMode) {
      goMode = false;
      clearTimeout(goTimer);
      const map = { h: '#/home', d: '#/drill', i: '#/intro', b: '#/browse', s: '#/stats', o: '#/settings' };
      const dest = map[e.key.toLowerCase()];
      if (dest) { e.preventDefault(); navigate(dest); return; }
    } else if (e.key.toLowerCase() === 'g') {
      goMode = true;
      goTimer = setTimeout(() => { goMode = false; }, 900);
      return;
    }

    if (viewHandler && viewHandler(e)) e.preventDefault();
  });
}
