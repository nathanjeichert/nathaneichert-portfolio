// Shared rendering for a rule's parts — used by Drill (reveal), Intro, and Browse.

import { h, tierChip } from './ui.js';
import { effTier } from './scheduler.js';
import { App } from './app.js';
import { froForRule, froReady } from './data.js';

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

/** One FRO excerpt: Themis-styled heading + verbatim section HTML. */
function froExcerpt(sec) {
  return h('div.fro-excerpt', {},
    h('div.fro-head', {},
      sec.ht ? h('span.fro-diamond', { title: 'Themis: highly tested' }) : null,
      h('span.fro-title', {}, sec.t),
      h('span.fro-crumb', {}, [...sec.crumb, ''].join(' › ')),
      h('span.fro-page', {}, 'p. ' + sec.page),
    ),
    h('div.fro-body', { html: sec.html }),
  );
}

/**
 * The Final Review Outline panel for a rule: verbatim excerpt(s) of the
 * mapped FRO section(s). Returns null when nothing is mapped/loaded yet.
 */
export function froPanel(rule) {
  const secs = froForRule(rule.id);
  if (!secs.length) {
    return froReady() ? null : h('div.fro-panel.fro-pending', {},
      h('div.part-label', {}, 'Final Review Outline'),
      h('p.dim', {}, 'Outline excerpts are still loading…'));
  }
  return h('div.fro-panel', {},
    h('div.fro-panel-head', {},
      h('div.part-label.fro-label', {}, 'Final Review Outline'),
      h('span.fro-src', {}, secs[0].doc),
    ),
    secs.map(froExcerpt),
  );
}

/** Collapsible wrapper around froPanel for the reference views (intro/browse). */
export function froDetails(rule, open = false) {
  if (!froForRule(rule.id).length) return null;
  return h('details.fro-details', { open },
    h('summary', {}, 'Final Review Outline excerpt'),
    froPanel(rule),
  );
}

/**
 * Lay a rendered card out with its FRO excerpt: two columns on wide screens
 * (rule left, outline right — same grid the drill reveal uses), otherwise the
 * collapsible block appended inside the card. Returns the element to mount.
 * 941px matches the reveal-grid stacking breakpoint in styles.css.
 */
export function withFro(cardEl, rule) {
  if (froForRule(rule.id).length && matchMedia('(min-width: 941px)').matches) {
    return h('div.reveal-grid', {}, cardEl, h('div.card-surface.fro-card', {}, froPanel(rule)));
  }
  const details = froDetails(rule);
  if (details) cardEl.append(details);
  return cardEl;
}
