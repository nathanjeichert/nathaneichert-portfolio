// Card selection: score = static_priority x urgency (x weak-subject boost, x jitter).
// All knobs live in constants.js.

import { SCHED } from './constants.js';
import { bundle } from './data.js';
import { recentAvg } from './state.js';

/** Effective tier after Nathan's overrides. */
export function effTier(rule, tierOverrides) {
  return tierOverrides[rule.id] || rule.tier;
}

/** static_priority recomputed against the effective tier. */
export function priority(rule, tierOverrides) {
  const t = effTier(rule, tierOverrides);
  if (t === rule.tier) return rule.static_priority;
  const tf = (bundle.tier_factor && bundle.tier_factor[t]) || 1;
  return (rule.subject_weight / 100) * (rule.area_weight / 100) * tf;
}

/** Overdue ratio, clamped. New cards get a fixed urgency. */
export function urgency(cs, now) {
  if (!cs) return SCHED.NEW_URGENCY;
  if (cs.interval <= 0) return SCHED.NEW_URGENCY;
  return Math.min(SCHED.URGENCY_CAP, Math.max(0, (now - cs.lastTs) / cs.interval));
}

/**
 * Weak-subject boost for unseen/stale cards: blend the subject's recent grade
 * mean into an expected grade at low weight; below-neutral subjects get a
 * gentle urgency multiplier (five 1s on PR cards nudge all of PR up the queue).
 */
export function subjectBoost(rule, cs, subjectMean, now) {
  if (cs && (now - cs.lastTs) < SCHED.STALE_AFTER) return 1;
  const mean = subjectMean.get(rule.subject);
  if (mean == null) return 1;
  const expected = (1 - SCHED.SUBJECT_BLEND) * SCHED.NEUTRAL_GRADE + SCHED.SUBJECT_BLEND * mean;
  const deficit = Math.max(0, (SCHED.NEUTRAL_GRADE - expected) / SCHED.NEUTRAL_GRADE);
  return 1 + Math.min(1, deficit * SCHED.SUBJECT_DEFICIT_SCALE) * SCHED.WEAK_BOOST_MAX;
}

const jitter = () => 1 + (Math.random() - 0.5) * 2 * SCHED.JITTER;

export function score(rule, cs, subjectMean, tierOverrides, now) {
  return priority(rule, tierOverrides) * urgency(cs, now) *
    subjectBoost(rule, cs, subjectMean, now) * jitter();
}

/**
 * Build a drill session queue.
 * @param {Object} opts
 * @param {import('./types.js').Rule[]} opts.rules       all rules
 * @param {Map} opts.cards                                folded card state
 * @param {Map} opts.subjectMean
 * @param {Object} opts.tierOverrides
 * @param {Set<string>} opts.flags                        delete-flagged ids (always excluded)
 * @param {Object<string, boolean>} opts.introduced       deck -> intro completed
 * @param {Object} opts.settings
 * @param {number} opts.length
 * @param {string[]} [opts.onlyIds]                       explicit queue (weakest-cards drill)
 * @returns {{queue: string[], nNew: number, nDue: number}}
 */
export function buildSession(opts) {
  const { rules, cards, subjectMean, tierOverrides, flags, introduced, settings } = opts;
  const now = Date.now();
  const length = opts.length || settings.sessionLength;

  if (opts.onlyIds && opts.onlyIds.length) {
    return { queue: opts.onlyIds.slice(0, length), nNew: 0, nDue: opts.onlyIds.length };
  }

  const eligible = rules.filter(r => {
    if (flags.has(r.id)) return false;
    const t = effTier(r, tierOverrides);
    if (t === 'T3' && !settings.includeT3) return false;
    if (settings.subjectFilter && r.deck !== settings.subjectFilter) return false;
    return true;
  });

  if (settings.cramMode) {
    // Cram: ignore intervals; lowest recent average first, T1 before T2/T3,
    // unseen cards go to the back (cram is for hammering what's weak, not intros).
    const seen = eligible.filter(r => cards.has(r.id));
    const unseen = eligible.filter(r => !cards.has(r.id));
    const tierRank = { T1: 0, T2: 1, T3: 2 };
    seen.sort((a, b) => {
      const ta = tierRank[effTier(a, tierOverrides)], tb = tierRank[effTier(b, tierOverrides)];
      if (ta !== tb) return ta - tb;
      const ga = recentAvg(cards.get(a.id)) ?? 0, gb = recentAvg(cards.get(b.id)) ?? 0;
      if (ga !== gb) return ga - gb;
      return priority(b, tierOverrides) - priority(a, tierOverrides);
    });
    unseen.sort((a, b) => priority(b, tierOverrides) - priority(a, tierOverrides));
    const queue = seen.concat(unseen).slice(0, length).map(r => r.id);
    return { queue, nNew: 0, nDue: queue.length };
  }

  // Due reviews, best score first.
  const due = eligible
    .filter(r => cards.has(r.id) && cards.get(r.id).due <= now)
    .map(r => ({ r, s: score(r, cards.get(r.id), subjectMean, tierOverrides, now) }))
    .sort((a, b) => b.s - a.s);

  // New cards (respect intro gating), best priority first.
  const fresh = eligible
    .filter(r => !cards.has(r.id) && (!settings.requireIntro || introduced[r.deck]))
    .map(r => ({ r, s: priority(r, tierOverrides) * subjectBoost(r, null, subjectMean, now) * jitter() }))
    .sort((a, b) => b.s - a.s);

  const t1Remain = fresh.some(x => effTier(x.r, tierOverrides) === 'T1');
  const ratio = t1Remain ? SCHED.NEW_RATIO : SCHED.NEW_RATIO_TAPER;
  let nNew = Math.min(fresh.length, Math.round(length * ratio));
  let nDue = Math.min(due.length, length - nNew);
  // Backfill: not enough reviews -> more new; not enough new -> more reviews.
  nNew = Math.min(fresh.length, length - nDue);
  nDue = Math.min(due.length, length - nNew);

  const pickedDue = due.slice(0, nDue).map(x => x.r.id);
  const pickedNew = fresh.slice(0, nNew).map(x => x.r.id);

  // Still short? Pull ahead-of-schedule reviews (nearest due first).
  let queueLen = pickedDue.length + pickedNew.length;
  let early = [];
  if (queueLen < length) {
    early = eligible
      .filter(r => cards.has(r.id) && cards.get(r.id).due > now)
      .sort((a, b) => cards.get(a.id).due - cards.get(b.id).due)
      .slice(0, length - queueLen)
      .map(r => r.id);
  }

  // Interleave new cards evenly among reviews so intros don't clump at the end.
  const reviews = pickedDue.concat(early);
  const queue = [];
  const gap = pickedNew.length ? Math.max(1, Math.floor((reviews.length + pickedNew.length) / (pickedNew.length + 1))) : 0;
  let ri = 0, ni = 0;
  while (ri < reviews.length || ni < pickedNew.length) {
    for (let k = 0; k < gap && ri < reviews.length; k++) queue.push(reviews[ri++]);
    if (ni < pickedNew.length) queue.push(pickedNew[ni++]);
    if (!gap) break;
  }
  while (ri < reviews.length) queue.push(reviews[ri++]);

  return { queue: queue.slice(0, length), nNew: pickedNew.length, nDue: pickedDue.length };
}

/** Count of cards due now (for home/stats badges). */
export function dueCount(rules, cards, tierOverrides, flags, settings, now = Date.now()) {
  let n = 0;
  for (const r of rules) {
    if (flags.has(r.id)) continue;
    const t = effTier(r, tierOverrides);
    if (t === 'T3' && !settings.includeT3) continue;
    const cs = cards.get(r.id);
    if (cs && cs.due <= now) n++;
  }
  return n;
}
