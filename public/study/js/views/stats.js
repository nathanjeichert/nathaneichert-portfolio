// Stats: exam countdown, T1-mastery progress ring, per-subject coverage,
// daily activity + streak, weakest cards (one tap to drill exactly those).

import { h, clear, ring, bars, sparkline, tierChip } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, rulesById, deckCodes, daysToExam } from '../data.js';
import { App, isIntroduced } from '../app.js';
import { effTier, dueCount, weakCount } from '../scheduler.js';
import { recentAvg, reviewsByDay, dayKey, streak } from '../state.js';
import { setDrillPreset } from './drill.js';
import { WEAKEST_LIST_SIZE } from '../constants.js';

export function renderStats(root, navigate) {
  const now = Date.now();
  const days = daysToExam(now);
  const live = bundle.rules.filter(r => !App.flags.has(r.id));

  // Progress ring: share of live T1 cards whose latest grade is >= 7.
  const t1 = live.filter(r => effTier(r, App.tierOverrides) === 'T1');
  const t1Ready = t1.filter(r => (App.cards.get(r.id)?.lastGrade ?? 0) >= 7).length;

  const seen = live.filter(r => App.cards.has(r.id)).length;
  const introduced = deckCodes.filter(isIntroduced).length;
  const spaced = App.settings.scheduling === 'spaced';
  const attention = spaced
    ? dueCount(bundle.rules, App.cards, App.tierOverrides, App.flags, App.settings, now)
    : weakCount(bundle.rules, App.cards, App.flags);

  // Per-subject rows, heaviest first.
  const subjects = new Map();
  for (const r of live) {
    let s = subjects.get(r.subject);
    if (!s) { s = { subject: r.subject, weight: r.subject_freq, total: 0, seen: 0, need: 0, gradeSum: 0, graded: 0 }; subjects.set(r.subject, s); }
    s.total++;
    const cs = App.cards.get(r.id);
    if (cs) {
      s.seen++;
      if (spaced ? cs.due <= now : (recentAvg(cs) ?? 9) <= 6) s.need++;
      const avg = recentAvg(cs);
      if (avg != null) { s.gradeSum += avg; s.graded++; }
    }
  }
  const subjectRows = [...subjects.values()].sort((a, b) => b.weight - a.weight);

  // Daily activity, last 14 days.
  const byDay = reviewsByDay(App.reviews);
  const dayVals = [];
  for (let i = 13; i >= 0; i--) {
    const ts = now - i * 86400000;
    const key = dayKey(ts);
    const d = new Date(ts);
    dayVals.push({ label: (d.getMonth() + 1) + '/' + d.getDate(), value: byDay.get(key) || 0 });
  }
  const todayCount = dayVals[dayVals.length - 1].value;

  // Weakest cards (seen, lowest recent average).
  const weakest = live
    .filter(r => App.cards.has(r.id))
    .map(r => ({ r, avg: recentAvg(App.cards.get(r.id)) ?? 0 }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, WEAKEST_LIST_SIZE)
    .filter(x => x.avg <= 7);

  clear(root).append(
    h('section.stats', {},
      h('div.stats-hero', {},
        h('div.countdown', {},
          h('div.countdown-num', {}, String(days)),
          h('div.countdown-label', {}, 'days until the bar'),
        ),
        h('div.ring-block', {},
          ring(t1.length ? t1Ready / t1.length : 0),
          h('div.ring-caption', {},
            h('strong', {}, `${t1Ready} / ${t1.length}`),
            h('span.dim', {}, ' T1 rules at grade ≥ 7'),
          ),
        ),
      ),

      h('div.summary-grid', {},
        h('div.stat-tile', {}, h('div.stat-num', {}, `${seen}`), h('div.stat-cap', {}, `of ${live.length} seen`)),
        h('div.stat-tile', {}, h('div.stat-num', {}, `${introduced}/${deckCodes.length}`), h('div.stat-cap', {}, 'decks introduced')),
        h('div.stat-tile', {}, h('div.stat-num', {}, String(attention)), h('div.stat-cap', {}, spaced ? 'due now' : 'weak cards')),
        h('div.stat-tile', {}, h('div.stat-num', {}, String(streak(App.reviews, now))), h('div.stat-cap', {}, 'day streak')),
      ),

      h('div.activity-block', {},
        h('h2', {}, 'Daily activity'),
        h('p.dim', {}, `${todayCount} today · goal ${App.settings.dailyGoal}/day`),
        bars(dayVals, { width: 340, height: 76, goal: App.settings.dailyGoal }),
      ),

      h('div.subject-block', {},
        h('h2', {}, 'Subjects'),
        h('table.subject-table', {},
          h('thead', {}, h('tr', {},
            h('th', {}, 'Subject'), h('th.num', {}, '% exams'), h('th.num', {}, 'Seen'),
            h('th.num', {}, 'Avg'), h('th.num', {}, spaced ? 'Due' : 'Weak'))),
          h('tbody', {}, subjectRows.map(s => {
            const avg = s.graded ? (s.gradeSum / s.graded) : null;
            return h('tr', {},
              h('td', {}, s.subject),
              h('td.num.dim', {}, s.weight + '%'),
              h('td.num', {}, `${s.seen}/${s.total}`),
              h('td.num' + (avg != null && avg < 5.5 ? '.weak-avg' : ''), {}, avg == null ? '—' : avg.toFixed(1)),
              h('td.num', {}, s.need || ''),
            );
          })),
        ),
      ),

      weakest.length ? h('div.weak-block', {},
        h('h2', {}, 'Weakest cards'),
        h('button.btn.btn-primary', {
          onclick: () => {
            setDrillPreset({ onlyIds: weakest.map(x => x.r.id), label: 'Weakest' });
            navigate('#/drill');
          },
        }, `Drill these ${weakest.length} (Enter)`),
        h('div.weak-list', {}, weakest.map(x => {
          const cs = App.cards.get(x.r.id);
          return h('button.weak-row', { onclick: () => navigate('#/browse/' + x.r.id) },
            h('span.ctx-id', {}, x.r.id),
            h('span.weak-prompt', {}, x.r.prompt),
            h('span.weak-meta', {}, sparkline(cs.grades.slice(-8), { width: 90, height: 26 }), tierChip(effTier(x.r, App.tierOverrides))),
          );
        })),
      ) : null,
    ),
  );

  setKeyHandler(e => {
    if (e.key === 'Enter' && weakest.length) {
      setDrillPreset({ onlyIds: weakest.map(x => x.r.id), label: 'Weakest' });
      navigate('#/drill');
      return true;
    }
    if (e.key === 'Escape') { navigate('#/home'); return true; }
    return false;
  });
}
