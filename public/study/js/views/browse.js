// Browse: searchable, filterable reference over all 806 rules.
// Row click opens the full card with its review history sparkline.

import { h, clear, toast, tierChip, gradeDot, sparkline, fmtDue, fmtAgo } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, rulesById, deckCodes, deckTitle, deckChecklist } from '../data.js';
import { App, cycleTier, toggleFlag } from '../app.js';
import { effTier, priority } from '../scheduler.js';
import { recentAvg } from '../state.js';
import { withFro } from '../cardview.js';

const filters = { q: '', deck: '', tier: '', status: '', sort: 'deck' };

function matches(rule) {
  if (filters.deck && rule.deck !== filters.deck) return false;
  if (filters.tier && effTier(rule, App.tierOverrides) !== filters.tier) return false;
  const cs = App.cards.get(rule.id);
  if (filters.status === 'unseen' && cs) return false;
  if (filters.status === 'seen' && !cs) return false;
  if (filters.status === 'weak' && !(cs && (recentAvg(cs) ?? 9) <= 6)) return false;
  if (filters.status === 'strong' && !(cs && (recentAvg(cs) ?? 0) >= 7)) return false;
  if (filters.status === 'due' && !(cs && cs.due <= Date.now())) return false;
  if (filters.status === 'flagged' && !App.flags.has(rule.id)) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = (rule.id + ' ' + rule.prompt + ' ' + rule.core.join(' ') + ' ' +
      rule.prose + ' ' + rule.name + ' ' + rule.section + ' ' + rule.area).toLowerCase();
    for (const term of q.split(/\s+/)) if (term && !hay.includes(term)) return false;
  }
  return true;
}

function sortRules(rules) {
  const bySort = {
    deck: (a, b) => a.deck === b.deck ? a.num - b.num : a.deck.localeCompare(b.deck),
    priority: (a, b) => priority(b, App.tierOverrides) - priority(a, App.tierOverrides),
    weakest: (a, b) => ((recentAvg(App.cards.get(a.id)) ?? 10) - (recentAvg(App.cards.get(b.id)) ?? 10)),
    due: (a, b) => ((App.cards.get(a.id)?.due ?? Infinity) - (App.cards.get(b.id)?.due ?? Infinity)),
  };
  return rules.sort(bySort[filters.sort] || bySort.deck);
}

export function renderBrowse(root, navigate, detailId) {
  const results = sortRules(bundle.rules.filter(matches));

  const sel = (name, options, value, onchange) =>
    h('select.filter-sel', { onchange: e => { onchange(e.target.value); redraw(); } },
      options.map(([v, label]) =>
        h('option', { value: v, selected: v === value }, label)));

  function redraw() { renderBrowse(root, navigate); }

  clear(root).append(
    h('section.browse', {},
      h('div.browse-filters', {},
        h('input.search', {
          type: 'search', placeholder: 'Search rules…  ( / )', value: filters.q,
          oninput: e => { filters.q = e.target.value; redrawListOnly(); },
        }),
        sel('deck', [['', 'All decks'], ...deckCodes.map(c => [c, deckTitle(c)])], filters.deck, v => { filters.deck = v; }),
        sel('tier', [['', 'All tiers'], ['T1', 'T1'], ['T2', 'T2'], ['T3', 'T3']], filters.tier, v => { filters.tier = v; }),
        sel('status', [['', 'Any status'], ['unseen', 'Unseen'], ['seen', 'Seen'], ['due', 'Due now'], ['weak', 'Weak (≤6)'], ['strong', 'Strong (≥7)'], ['flagged', 'Flagged']], filters.status, v => { filters.status = v; }),
        sel('sort', [['deck', 'Deck order'], ['priority', 'Priority'], ['weakest', 'Weakest'], ['due', 'Due soonest']], filters.sort, v => { filters.sort = v; }),
      ),
      filters.deck ? checklistBlock(filters.deck) : null,
      h('div.browse-count.dim', {}, `${results.length} rule${results.length === 1 ? '' : 's'}`),
      h('div.browse-list', {}, results.slice(0, 400).map(r => row(r))),
      results.length > 400 ? h('p.dim.browse-more', {}, `Showing first 400 — narrow the filters to see the rest.`) : null,
    ),
  );

  function redrawListOnly() {
    const list = root.querySelector('.browse-list');
    const count = root.querySelector('.browse-count');
    const res = sortRules(bundle.rules.filter(matches));
    if (count) count.textContent = `${res.length} rule${res.length === 1 ? '' : 's'}`;
    if (list) { clear(list).append(...res.slice(0, 400).map(r => row(r))); }
  }

  function row(rule) {
    const cs = App.cards.get(rule.id);
    const flagged = App.flags.has(rule.id);
    return h('button.browse-row' + (flagged ? '.flagged' : ''), { onclick: () => openDetail(rule.id) },
      h('span.ctx-id', {}, rule.id),
      h('span.browse-prompt', {}, rule.prompt),
      h('span.browse-meta', {},
        flagged ? h('span.flag-badge', {}, 'DEL') : null,
        tierChip(effTier(rule, App.tierOverrides)),
        cs ? gradeDot(cs.lastGrade) : h('span.chip.chip-new', {}, 'new'),
      ),
    );
  }

  function checklistBlock(code) {
    const list = deckChecklist(code);
    if (!list.length) return null;
    return h('details.checklist-details', {},
      h('summary', {}, deckTitle(code) + ' — essay attack order'),
      h('ol.checklist', {}, list.map(l => h('li', {}, l))),
    );
  }

  function openDetail(id) {
    const rule = rulesById.get(id);
    if (!rule) return;
    const cs = App.cards.get(id);
    const revs = App.reviews.filter(r => r.id === id);
    const flagged = App.flags.has(id);

    const body = h('div.detail-body', {},
      h('div.prompt.prompt-detail', {}, rule.prompt),
      h('div.core', {}, rule.core.map(l => h('div.core-line', {}, l))),
      rule.prose ? h('div.prose', {}, h('div.part-label', {}, 'Say it'), h('p', {}, rule.prose)) : null,
      rule.tip ? h('div.tip', {}, h('div.part-label', {}, 'Exam tip'), h('p', {}, rule.tip)) : null,
      rule.name ? h('div.anchor', {}, rule.name) : null,
    );
    const laid = withFro(body, rule);

    const overlay = h('div.overlay', { onclick: e => { if (e.target === overlay) close(); } },
      h('div.dialog.detail' + (laid === body ? '' : '.detail-wide'), {},
        h('div.detail-head', {},
          h('span.ctx-id', {}, rule.id),
          tierChip(effTier(rule, App.tierOverrides)),
          h('span.dim', {}, `${rule.subject} · ${rule.area} · ${rule.section}`),
          h('button.btn.btn-ghost.detail-close', { onclick: close }, '✕'),
        ),
        laid,
        h('div.detail-history', {},
          h('h3', {}, 'History'),
          cs ? h('div.detail-history-row', {},
            sparkline(cs.grades),
            h('span.dim', {}, `seen ${cs.seen}× · last ${fmtAgo(cs.lastTs)}` +
              (App.settings.scheduling === 'spaced' ? ` · ${fmtDue(cs.due)}` : '') +
              (cs.hints ? ` · ${cs.hints} hints` : '')),
          ) : h('p.dim', {}, 'Never drilled.'),
        ),
        h('div.dialog-row', {},
          h('button.btn', {
            onclick: async () => { const t = await cycleTier(id); toast(`${id} → ${t}`); close(); openDetail(id); },
          }, 'Re-tier (T)'),
          h('button.btn' + (flagged ? '' : '.btn-danger-ghost'), {
            onclick: async () => { const on = await toggleFlag(id); toast(on ? `${id} flagged for deletion` : `${id} unflagged`); close(); redraw(); },
          }, flagged ? 'Unflag (D)' : 'Flag for deletion (D)'),
        ),
      ),
    );
    function close() { overlay.remove(); }
    document.body.append(overlay);
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape') close();
      if (e.key.toLowerCase() === 't') overlay.querySelectorAll('.dialog-row .btn')[0].click();
      if (e.key.toLowerCase() === 'd') overlay.querySelectorAll('.dialog-row .btn')[1].click();
    });
    overlay.focus();
  }

  if (detailId) openDetail(detailId);

  setKeyHandler(e => {
    if (e.key === '/') { root.querySelector('.search')?.focus(); return true; }
    if (e.key === 'Escape') { navigate('#/home'); return true; }
    return false;
  });
}
