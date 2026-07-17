// Fast-reading ("bionic") renderer: bolds the first part of each word in the
// heavy reading surfaces — rule cards and FRO excerpts — so the eye gets
// fixation anchors. Pure DOM, no fonts, no dependencies.
//
// How it stays cheap and safe:
//   - Words are wrapped in inert <span class="bx">. Their weight only changes
//     under html[data-bionic], so toggling off is just removing that attribute
//     (theme.js does it) — no DOM surgery, no re-render.
//   - Containers are marked data-bx once processed and never touched again.
//     Views rebuild their DOM on every render, so fresh nodes are re-processed
//     by the MutationObserver as they appear.

/** The reading surfaces that get bionic treatment. */
const SELECTOR = [
  '.prompt', '.core-line', '.prose p', '.tip p', '.anchor',
  '.fro-body', '.checklist li',
].join(', ');

/** Never restyle text inside these (already bold, code-ish, or interactive). */
const SKIP = new Set(['B', 'STRONG', 'CODE', 'KBD', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'BUTTON', 'SVG']);

const WORD = /[\p{L}\p{M}][\p{L}\p{M}\p{N}'’]*/gu;

let enabled = false;

/** Bold-prefix length for an n-char word (~40-50%, Bionic-Reading-style). */
function fixLen(n) {
  if (n <= 1) return 1;
  if (n <= 4) return Math.ceil(n / 2);
  return Math.ceil(n * 0.4);
}

function bionicizeTextNode(node) {
  const text = node.nodeValue;
  WORD.lastIndex = 0;
  if (!WORD.test(text)) return;
  const frag = document.createDocumentFragment();
  let pos = 0;
  for (const m of text.matchAll(WORD)) {
    const w = m[0];
    if (m.index > pos) frag.append(text.slice(pos, m.index));
    const cut = fixLen(w.length);
    const b = document.createElement('span');
    b.className = 'bx';
    b.textContent = w.slice(0, cut);
    frag.append(b);
    if (cut < w.length) frag.append(w.slice(cut));
    pos = m.index + w.length;
  }
  if (pos < text.length) frag.append(text.slice(pos));
  node.replaceWith(frag);
}

function process(el) {
  if (el.dataset.bx) return;
  el.dataset.bx = '1';
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      for (let p = n.parentElement; p && p !== el.parentElement; p = p.parentElement) {
        if (SKIP.has(p.tagName.toUpperCase()) || p.classList.contains('bx')) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(bionicizeTextNode);
}

function sweep(root) {
  if (root.nodeType !== Node.ELEMENT_NODE || root.classList.contains('bx')) return;
  if (root.matches(SELECTOR)) process(root);
  root.querySelectorAll(SELECTOR).forEach(process);
}

/** Watch the whole app for freshly rendered reading surfaces. Call once at boot. */
export function initBionic() {
  const obs = new MutationObserver(records => {
    if (!enabled) return;
    for (const r of records) for (const n of r.addedNodes) sweep(n);
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

/** Turn processing on/off; on-enable, catches anything already on screen. */
export function setBionic(on) {
  enabled = !!on;
  if (enabled) sweep(document.body);
}
