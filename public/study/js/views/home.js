// Home: countdown, one-keystroke session start, due/new counts, goal + streak,
// intro nudges, empty states.

import { h, clear } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, rulesByDeck, deckCodes, deckTitle, daysToExam } from '../data.js';
import { App, isIntroduced, saveSettings } from '../app.js';
import { dueCount, effTier } from '../scheduler.js';
import { streak, dayKey, reviewsByDay } from '../state.js';
import { INTRO_SECONDS_PER_RULE } from '../constants.js';

export function renderHome(root, navigate) {
  const now = Date.now();
  const days = daysToExam(now);
  const due = dueCount(bundle.rules, App.cards, App.tierOverrides, App.flags, App.settings, now);

  // new cards available (respecting gating + filters)
  let freshAvail = 0, freshGated = 0;
  for (const r of bundle.rules) {
    if (App.flags.has(r.id) || App.cards.has(r.id)) continue;
    const t = effTier(r, App.tierOverrides);
    if (t === 'T3' && !App.settings.includeT3) continue;
    if (App.settings.requireIntro && !isIntroduced(r.deck)) { freshGated++; continue; }
    freshAvail++;
  }

  const today = reviewsByDay(App.reviews).get(dayKey(now)) || 0;
  const goal = App.settings.dailyGoal;
  const stk = streak(App.reviews, now);

  // Intro nudges: un-introduced decks, heaviest subjects first.
  const nudges = deckCodes
    .filter(code => !isIntroduced(code))
    .map(code => {
      const rules = rulesByDeck.get(code) || [];
      const started = App.introProgress[code] || 0;
      const weight = rules.length ? Math.max(...rules.map(r => r.subject_weight)) : 0;
      const mins = Math.max(1, Math.round(((rules.length - started) * INTRO_SECONDS_PER_RULE) / 60));
      return { code, started, total: rules.length, weight, mins };
    })
    .sort((a, b) => b.weight - a.weight);

  const allCaughtUp = due === 0 && freshAvail === 0;

  clear(root).append(
    h('section.home', {},
      h('div.countdown', {},
        h('div.countdown-num', {}, String(days)),
        h('div.countdown-label', {}, days === 1 ? 'day until the bar' : 'days until the bar'),
      ),

      h('div.home-actions', {},
        h('button.btn.btn-primary.btn-big', { onclick: () => navigate('#/drill') },
          App.settings.cramMode ? 'Start cram session' : 'Start session',
          h('span.btn-sub', {}, due ? `${due} due` : (freshAvail ? `${freshAvail} new available` : 'weakest cards')),
        ),
        h('div.home-stats', {},
          h('div.stat-tile', {}, h('div.stat-num', {}, String(today)), h('div.stat-cap', {}, `of ${goal} today`)),
          h('div.stat-tile', {}, h('div.stat-num', {}, String(stk)), h('div.stat-cap', {}, stk === 1 ? 'day streak' : 'day streak')),
          h('div.stat-tile', {}, h('div.stat-num', {}, String(due)), h('div.stat-cap', {}, 'due now')),
        ),
      ),

      App.settings.cramMode ? h('div.cram-note', {},
        'Cram mode is on — intervals ignored, weakest T1 cards first. ',
        h('a', { href: '#', onclick: async e => { e.preventDefault(); App.settings.cramMode = false; await saveSettings(); renderHome(root, navigate); } }, 'Turn off'),
      ) : null,

      allCaughtUp ? h('div.empty-state', {},
        h('p', {}, freshGated
          ? 'Nothing due — new cards are waiting behind subject intros.'
          : 'All caught up. Nothing due right now.'),
        h('p.dim', {}, `${days} days out — a cram pass through weak cards never hurts.`),
        h('button.btn', { onclick: async () => { App.settings.cramMode = true; await saveSettings(); navigate('#/drill'); } }, 'Drill weakest cards'),
      ) : null,

      nudges.length ? h('div.nudges', {},
        h('h2', {}, 'Subject intros'),
        h('p.dim', {}, 'One orienting pass per subject unlocks its new cards for drilling.'),
        h('div.nudge-list', {}, nudges.slice(0, 5).map(n =>
          h('button.nudge', { onclick: () => navigate('#/intro/' + n.code) },
            h('span.nudge-title', {}, deckTitle(n.code)),
            h('span.nudge-meta', {},
              n.started ? `resume ${n.started}/${n.total} · ~${n.mins} min` : `${n.total} rules · ~${n.mins} min`),
          ))),
        nudges.length > 5 ? h('a.dim.more-link', { href: '#/intro' }, `all ${nudges.length} remaining intros →`) : null,
      ) : null,
    ),
  );

  setKeyHandler(e => {
    if (e.key === 'Enter' || e.key === ' ') { navigate('#/drill'); return true; }
    return false;
  });
}
