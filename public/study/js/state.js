// Derives all card state by folding the append-only review log.
// History is never mutated; undo entries cancel the latest un-undone review.

import { SCHED } from './constants.js';
import { rulesById } from './data.js';

const clampEase = e => Math.min(SCHED.EASE_MAX, Math.max(SCHED.EASE_MIN, e));

/** Apply undo tombstones: returns the effective review list, oldest first. */
export function effectiveReviews(log) {
  /** @type {Array<{id:string, ts:number, g:number, h:number}>} */
  const out = [];
  for (const e of log) {
    if (e.t === 'u') out.pop();
    else if (e.t === 'r') out.push(e);
  }
  return out;
}

/**
 * Fold the log into per-card scheduling state.
 * @returns {{cards: Map<string, import('./types.js').CardState>,
 *            subjectMean: Map<string, number>,
 *            reviews: Array}}
 */
export function foldState(log) {
  const reviews = effectiveReviews(log);
  const cards = new Map();
  const subjectMean = new Map();

  for (const r of reviews) {
    let s = cards.get(r.id);
    if (!s) {
      s = { seen: 0, ease: SCHED.START_EASE, interval: 0, lastTs: 0, lastGrade: 0,
            due: 0, lapses: 0, grades: [], hints: 0 };
      cards.set(r.id, s);
    }
    // Hints cap the grade used for scheduling; the raw grade stays in s.grades.
    const hints = Math.min(r.h || 0, SCHED.HINT_GRADE_CAP.length - 1);
    const g = Math.min(r.g, SCHED.HINT_GRADE_CAP[hints]);

    if (g <= 3) {
      s.interval = SCHED.FAIL_INTERVAL;
      s.ease = clampEase(s.ease + SCHED.EASE_FAIL);
      s.lapses++;
    } else if (g <= 6) {
      s.interval = Math.max(SCHED.FIRST_PASS, s.interval * SCHED.HARD_MULT);
    } else {
      if (s.interval < SCHED.FIRST_PASS) s.interval = SCHED.FIRST_PASS;
      else if (s.interval < SCHED.SECOND_PASS) s.interval = SCHED.SECOND_PASS;
      else s.interval = s.interval * s.ease;
      s.ease = clampEase(s.ease + SCHED.EASE_PASS);
    }
    s.interval = Math.min(s.interval, SCHED.INTERVAL_CAP);
    s.seen++;
    s.lastTs = r.ts;
    s.lastGrade = r.g;
    s.due = r.ts + s.interval;
    s.grades.push(r.g);
    s.hints += r.h || 0;

    // Per-subject exponentially-weighted grade mean (weak prior, §5).
    const rule = rulesById.get(r.id);
    if (rule) {
      const prev = subjectMean.get(rule.subject);
      const a = SCHED.SUBJECT_EWMA_ALPHA;
      subjectMean.set(rule.subject, prev == null ? r.g : a * r.g + (1 - a) * prev);
    }
  }
  return { cards, subjectMean, reviews };
}

/** Average of the last n raw grades for a card state (null if unseen). */
export function recentAvg(cs, n = 3) {
  if (!cs || cs.grades.length === 0) return null;
  const g = cs.grades.slice(-n);
  return g.reduce((a, b) => a + b, 0) / g.length;
}

/** Group effective reviews by local calendar day: Map<'YYYY-MM-DD', count>. */
export function reviewsByDay(reviews) {
  const days = new Map();
  for (const r of reviews) {
    const d = new Date(r.ts);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
      '-' + String(d.getDate()).padStart(2, '0');
    days.set(key, (days.get(key) || 0) + 1);
  }
  return days;
}

export function dayKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0');
}

/** Consecutive days (ending today or yesterday) with at least one review. */
export function streak(reviews, now = Date.now()) {
  const days = reviewsByDay(reviews);
  let n = 0;
  let t = now;
  if (!days.has(dayKey(t))) t -= 86400000;           // today empty? streak may end yesterday
  while (days.has(dayKey(t))) { n++; t -= 86400000; }
  return n;
}
