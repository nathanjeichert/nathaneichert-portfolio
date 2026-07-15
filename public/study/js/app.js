// Central app state + actions. Views import this singleton.

import { DEFAULT_SETTINGS } from './constants.js';
import { bundle, rulesById, rulesByDeck } from './data.js';
import { getLog, appendLog, kvGet, kvSet } from './store.js';
import { foldState } from './state.js';

export const App = {
  settings: { ...DEFAULT_SETTINGS },
  tierOverrides: {},          // id -> 'T1'|'T2'|'T3'
  flags: new Set(),           // delete-flagged ids
  introProgress: {},          // deck -> next rule index; >= deck length means introduced
  meta: {},                   // lastExport, reviewsAtExport, schema_version, generated
  // derived (recomputed after every log append / import):
  cards: new Map(),
  subjectMean: new Map(),
  reviews: [],
  // transient session state (drill view owns the details)
  session: null,
};

export function recompute() {
  const folded = foldState(getLog());
  App.cards = folded.cards;
  App.subjectMean = folded.subjectMean;
  App.reviews = folded.reviews;
}

export async function loadPersisted() {
  const stored = await kvGet('settings', {});
  // Migration (July 2026): continuous/endless replaced interval scheduling as
  // the default. Profiles saved before that carry old keys — adopt the new
  // defaults for them rather than pinning them to the old behavior.
  if (stored.scheduling === undefined) {
    delete stored.sessionLength;
    delete stored.cramMode;
  }
  App.settings = { ...DEFAULT_SETTINGS, ...stored };
  App.tierOverrides = await kvGet('tierOverrides', {});
  App.flags = new Set(await kvGet('deleteFlags', []));
  App.introProgress = await kvGet('introProgress', {});
  App.meta = await kvGet('meta', {});
  // Bundle rollover: remember which bundle this progress was built against.
  if (bundle && (App.meta.generated !== bundle.generated || App.meta.schema_version !== bundle.schema_version)) {
    App.meta.generated = bundle.generated;
    App.meta.schema_version = bundle.schema_version;
    await kvSet('meta', App.meta);
  }
  recompute();
}

export async function saveSettings() { await kvSet('settings', App.settings); }
export async function saveOverrides() { await kvSet('tierOverrides', App.tierOverrides); }
export async function saveFlags() { await kvSet('deleteFlags', [...App.flags]); }
export async function saveIntro() { await kvSet('introProgress', App.introProgress); }
export async function saveMeta() { await kvSet('meta', App.meta); }

/** Record a graded review. */
export async function gradeCard(id, grade, hints) {
  await appendLog({ t: 'r', id, ts: Date.now(), g: grade, h: hints });
  recompute();
}

/** Undo the most recent review (append-only tombstone). Returns the undone review or null. */
export async function undoLast() {
  const last = App.reviews[App.reviews.length - 1] || null;
  if (!last) return null;
  await appendLog({ t: 'u', ts: Date.now() });
  recompute();
  return last;
}

/** Cycle the tier override T1 -> T2 -> T3 -> T1 for a rule. Returns new tier. */
export async function cycleTier(id) {
  const rule = rulesById.get(id);
  const cur = App.tierOverrides[id] || rule.tier;
  const next = cur === 'T1' ? 'T2' : cur === 'T2' ? 'T3' : 'T1';
  if (next === rule.tier) delete App.tierOverrides[id];
  else App.tierOverrides[id] = next;
  await saveOverrides();
  return next;
}

/** Toggle the delete flag for a rule. Returns true if now flagged. */
export async function toggleFlag(id) {
  const on = !App.flags.has(id);
  if (on) App.flags.add(id); else App.flags.delete(id);
  await saveFlags();
  return on;
}

export function isIntroduced(deck) {
  const rules = rulesByDeck.get(deck) || [];
  return (App.introProgress[deck] || 0) >= rules.length && rules.length > 0;
}

/** Live (not delete-flagged) rules. */
export function liveRules() {
  return bundle.rules.filter(r => !App.flags.has(r.id));
}
