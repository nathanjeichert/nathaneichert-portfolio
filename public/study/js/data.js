// Loads rules.json and builds the lookup indexes every view uses.

/** @type {import('./types.js').Bundle} */
export let bundle = null;

/** @type {Map<string, import('./types.js').Rule>} */
export const rulesById = new Map();

/** @type {Map<string, import('./types.js').Rule[]>} deck code -> rules in deck order */
export const rulesByDeck = new Map();

/** @type {Map<string, {name: string, rules: import('./types.js').Rule[]}[]>} deck -> ordered sections */
export const sectionsByDeck = new Map();

/** Deck codes in bundle order. */
export let deckCodes = [];

export async function loadData() {
  const res = await fetch('/study/rules.json');
  if (!res.ok) throw new Error('rules.json fetch failed: ' + res.status);
  bundle = await res.json();

  rulesById.clear(); rulesByDeck.clear(); sectionsByDeck.clear();
  deckCodes = Object.keys(bundle.decks);
  for (const code of deckCodes) rulesByDeck.set(code, []);

  for (const r of bundle.rules) {
    rulesById.set(r.id, r);
    if (!rulesByDeck.has(r.deck)) { rulesByDeck.set(r.deck, []); deckCodes.push(r.deck); }
    rulesByDeck.get(r.deck).push(r);
  }
  for (const [code, rules] of rulesByDeck) {
    rules.sort((a, b) => a.num - b.num);
    const sections = [];
    let cur = null;
    for (const r of rules) {
      if (!cur || cur.name !== r.section) { cur = { name: r.section, rules: [] }; sections.push(cur); }
      cur.rules.push(r);
    }
    sectionsByDeck.set(code, sections);
  }
  return bundle;
}

export function deckTitle(code) {
  const t = (bundle.decks[code] && bundle.decks[code].title) || code;
  return t.replace(/\s*[—-]\s*Essay Rules\s*$/i, '');
}

export function deckChecklist(code) {
  return (bundle.decks[code] && bundle.decks[code].checklist) || [];
}

/** Days until the exam (ceil, min 0). */
export function daysToExam(now = Date.now()) {
  const exam = new Date((bundle?.exam_date || '2026-07-28') + 'T08:00:00');
  return Math.max(0, Math.ceil((exam.getTime() - now) / 86400000));
}

/** Dominant area of a section (most rules), for frequency badges. */
export function sectionArea(section) {
  const counts = new Map();
  for (const r of section.rules) counts.set(r.area, (counts.get(r.area) || 0) + 1);
  let best = null, n = -1;
  for (const [area, c] of counts) if (c > n) { best = area; n = c; }
  return best;
}

/** Raw area frequency (% of that subject's essays reaching the area). */
export function areaFreq(subject, area) {
  const m = bundle.area_frequency && bundle.area_frequency[subject];
  return m && area in m ? m[area] : null;
}
