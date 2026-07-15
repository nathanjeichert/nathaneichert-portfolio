// Home: countdown, one-keystroke session start, due/new counts, goal + streak,
// intro nudges, empty states.

import { h, clear } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, rulesByDeck, deckCodes, deckTitle, daysToExam } from '../data.js';
import { App, isIntroduced } from '../app.js';
import { dueCount, weakCount, effTier } from '../scheduler.js';
import { streak, dayKey, reviewsByDay } from '../state.js';
import { INTRO_SECONDS_PER_RULE } from '../constants.js';

export function renderHome(root, navigate) {
  const now = Date.now();
  const days = daysToExam(now);
  const spaced = App.settings.scheduling === 'spaced';
  const due = dueCount(bundle.rules, App.cards, App.tierOverrides, App.flags, App.settings, now);
  const weak = weakCount(bundle.rules, App.cards, App.flags);

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

  // Continuous mode always has cards once anything is seen or unlocked;
  // "caught up" only means nothing is unlocked at all.
  const nothingAvailable = spaced ? (due === 0 && freshAvail === 0)
    : (freshAvail === 0 && App.cards.size === 0);

  const startSub = spaced
    ? (due ? `${due} due` : (freshAvail ? `${freshAvail} new available` : 'weakest cards'))
    : [freshAvail ? `${freshAvail} unseen` : null, weak ? `${weak} weak` : null]
        .filter(Boolean).join(' · ') || 'keep sharpening';

  clear(root).append(
    h('section.home', {},
      h('div.countdown', {},
        h('div.countdown-num', {}, String(days)),
        h('div.countdown-label', {}, days === 1 ? 'day until the bar' : 'days until the bar'),
      ),

      h('div.home-actions', {},
        h('button.btn.btn-primary.btn-big', { onclick: () => navigate('#/drill') },
          'Start session',
          h('span.btn-sub', {}, startSub),
        ),
        h('div.home-stats', {},
          h('div.stat-tile', {}, h('div.stat-num', {}, String(today)), h('div.stat-cap', {}, `of ${goal} today`)),
          h('div.stat-tile', {}, h('div.stat-num', {}, String(stk)), h('div.stat-cap', {}, 'day streak')),
          h('div.stat-tile', {}, h('div.stat-num', {}, String(spaced ? due : weak)), h('div.stat-cap', {}, spaced ? 'due now' : 'weak cards')),
        ),
      ),

      nothingAvailable ? h('div.empty-state', {},
        h('p', {}, freshGated
          ? 'New cards are waiting behind subject intros — one pass unlocks a deck.'
          : 'Nothing unlocked yet. Start with a subject intro below.'),
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
