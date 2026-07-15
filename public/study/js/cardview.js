// Shared rendering for a rule's parts — used by Drill (reveal), Intro, and Browse.

import { h, tierChip } from './ui.js';
import { effTier } from './scheduler.js';
import { App } from './app.js';

/** Context line: subject · area · id · tier chip. */
export function contextLine(rule, extra) {
  return h('div.ctx', {},
    h('span.ctx-subject', {}, rule.subject),
    h('span.ctx-sep', {}, '·'),
    h('span', {}, rule.area),
    h('span.ctx-sep', {}, '·'),
    h('span.ctx-id', {}, rule.id),
    tierChip(effTier(rule, App.tierOverrides)),
    extra || null,
  );
}

export function promptBlock(rule) {
  return h('div.prompt', {}, rule.prompt);
}

/** Skeleton hint lines (bare or guided). */
export function skeletonBlock(lines, label) {
  return h('div.skeleton', {},
    h('div.part-label', {}, label),
    lines.map(l => h('div.skel-line', {}, l)),
  );
}

/** The full answer: CORE (primary), PROSE (say-it-aloud), TIP, NAME. */
export function answerBlock(rule) {
  return h('div.answer', {},
    h('div.core', {}, rule.core.map(l => h('div.core-line', {}, l))),
    rule.prose ? h('div.prose', {},
      h('div.part-label', {}, 'Say it'),
      h('p', {}, rule.prose),
    ) : null,
    rule.tip ? h('div.tip', {},
      h('div.part-label', {}, 'Exam tip'),
      h('p', {}, rule.tip),
    ) : null,
    rule.name ? h('div.anchor', {}, rule.name) : null,
  );
}
