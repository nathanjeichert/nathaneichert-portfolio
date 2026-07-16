// Subject Intro: deck list -> subject map (checklist + section outline) ->
// guided walkthrough (prompt+answer together, no grading). Progress persists.

import { h, clear, onSwipe, toast, confirmDialog } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { rulesByDeck, sectionsByDeck, deckCodes, deckTitle, deckChecklist, sectionArea, areaFreq } from '../data.js';
import { App, isIntroduced, saveIntro, toggleFlag } from '../app.js';
import { contextLine, answerBlock, froDetails } from '../cardview.js';
import { INTRO_SECONDS_PER_RULE } from '../constants.js';

const estMin = n => Math.max(1, Math.round((n * INTRO_SECONDS_PER_RULE) / 60));

// --- deck list ---
export function renderIntroList(root, navigate) {
  const items = deckCodes.map(code => {
    const rules = rulesByDeck.get(code) || [];
    const done = isIntroduced(code);
    const started = App.introProgress[code] || 0;
    const weight = rules.length ? rules[0].subject_weight : 0;
    return { code, rules, done, started, weight };
  }).sort((a, b) => (a.done - b.done) || (b.weight - a.weight));

  const notDone = items.filter(it => !it.done);

  async function markAll() {
    const ok = await confirmDialog(
      `Mark all ${notDone.length} remaining deck${notDone.length === 1 ? '' : 's'} as introduced? Their cards enter the drill rotation immediately.`,
      { yes: 'Mark all introduced' });
    if (!ok) return;
    for (const it of notDone) App.introProgress[it.code] = it.rules.length;
    await saveIntro();
    toast('All decks marked introduced');
    renderIntroList(root, navigate);
  }

  clear(root).append(
    h('section.intro-list', {},
      h('h1', {}, 'Subject intros'),
      h('p.dim', {}, 'A fast orienting pass through each deck — see every rule once so drilling has something to latch onto.'),
      h('div.deck-grid', {}, items.map(it =>
        h('button.deck-card' + (it.done ? '.done' : ''), { onclick: () => navigate('#/intro/' + it.code) },
          h('div.deck-card-title', {}, deckTitle(it.code)),
          h('div.deck-card-meta', {},
            it.done ? 'Introduced ✓'
              : it.started ? `${it.started}/${it.rules.length} · resume`
              : `${it.rules.length} rules · ~${estMin(it.rules.length)} min`),
        ))),
      notDone.length ? h('p.intro-markall', {},
        h('button.btn.btn-ghost.btn-small', { onclick: markAll },
          `Mark all ${notDone.length} remaining as introduced`),
      ) : null,
    ),
  );
  setKeyHandler(e => {
    if (e.key === 'Escape') { navigate('#/home'); return true; }
    return false;
  });
}

// --- subject map ---
export function renderIntroMap(root, navigate, code) {
  const rules = rulesByDeck.get(code);
  if (!rules) { navigate('#/intro'); return; }
  const sections = sectionsByDeck.get(code) || [];
  const checklist = deckChecklist(code);
  const started = Math.min(App.introProgress[code] || 0, rules.length);
  const done = isIntroduced(code);
  const subject = rules[0]?.subject;

  clear(root).append(
    h('section.intro-map', {},
      h('div.view-head', {},
        h('button.btn.btn-ghost', { onclick: () => navigate('#/intro') }, '← All subjects'),
      ),
      h('h1', {}, deckTitle(code)),
      h('p.dim', {}, `${rules.length} rules · ~${estMin(rules.length - (done ? 0 : started))} min${done ? ' · introduced ✓' : started ? ` · resuming at ${started + 1}` : ''}`),

      checklist.length ? h('div.checklist-card', {},
        h('h2', {}, 'How an essay flows'),
        h('ol.checklist', {}, checklist.map(line => h('li', {}, line))),
      ) : null,

      h('div.section-outline', {},
        h('h2', {}, 'Outline'),
        sections.map(sec => {
          const area = sectionArea(sec);
          const freq = area && subject ? areaFreq(sec.rules[0].subject, area) : null;
          return h('div.section-row', {},
            h('span.section-name', {}, sec.name),
            h('span.section-meta', {},
              `${sec.rules.length} rule${sec.rules.length === 1 ? '' : 's'}`,
              freq != null ? h('span.freq-badge', { title: `${area} appears in ${freq}% of ${subject} essays` }, `${freq}%`) : null,
            ),
          );
        }),
      ),

      h('div.intro-start-row', {},
        h('button.btn.btn-primary.btn-big', { onclick: () => navigate(`#/intro/${code}/run`) },
          done ? 'Walk through again' : started ? 'Resume walkthrough' : 'Start walkthrough',
          h('span.btn-sub', {}, 'Enter · Space/→ steps forward'),
        ),
      ),
      h('p.intro-markall', {},
        done
          ? h('button.btn.btn-ghost.btn-small', {
              onclick: async () => {
                App.introProgress[code] = 0;
                await saveIntro();
                toast(`${deckTitle(code)} intro reset`);
                renderIntroMap(root, navigate, code);
              },
            }, 'Reset intro progress')
          : h('button.btn.btn-ghost.btn-small', {
              onclick: async () => {
                App.introProgress[code] = rules.length;
                await saveIntro();
                toast(`${deckTitle(code)} marked introduced — cards are in the rotation`);
                renderIntroMap(root, navigate, code);
              },
            }, 'Mark as introduced without walking through'),
      ),
    ),
  );

  setKeyHandler(e => {
    if (e.key === 'Enter' || e.key === ' ') { navigate(`#/intro/${code}/run`); return true; }
    if (e.key === 'Escape') { navigate('#/intro'); return true; }
    return false;
  });
}

// --- walkthrough ---
export function renderIntroRun(root, navigate, code) {
  const rules = rulesByDeck.get(code);
  if (!rules || !rules.length) { navigate('#/intro'); return; }
  const wasDone = isIntroduced(code);
  let idx = wasDone ? 0 : Math.min(App.introProgress[code] || 0, rules.length - 1);

  async function savePos(pos) {
    // Never regress a completed deck below "introduced".
    App.introProgress[code] = wasDone ? Math.max(rules.length, pos) : pos;
    await saveIntro();
  }

  function finish() {
    App.introProgress[code] = rules.length;
    saveIntro();
    clear(root).append(
      h('section.intro-done', {},
        h('div.big-check', {}, '✓'),
        h('h1', {}, deckTitle(code) + ' introduced'),
        h('p.dim', {}, `${rules.length} rules seen. New ${code} cards are now in the drill rotation.`),
        h('div.dialog-row', {},
          h('button.btn', { onclick: () => navigate('#/intro') }, 'All subjects'),
          h('button.btn.btn-primary', { onclick: () => navigate('#/drill') }, 'Drill now (Enter)'),
        ),
      ),
    );
    setKeyHandler(e => {
      if (e.key === 'Enter') { navigate('#/drill'); return true; }
      if (e.key === 'Escape') { navigate('#/intro'); return true; }
      return false;
    });
  }

  async function flagCurrent() {
    const rule = rules[idx];
    const on = await toggleFlag(rule.id);
    toast(on ? `${rule.id} flagged for deletion (Settings → export the list)` : `${rule.id} unflagged`);
    draw();
  }

  function draw() {
    const rule = rules[idx];
    const flagged = App.flags.has(rule.id);
    // position within section
    const sameSection = rules.filter(r => r.section === rule.section);
    const posInSection = sameSection.findIndex(r => r.id === rule.id) + 1;

    clear(root).append(
      h('section.intro-run', {},
        h('div.run-head', {},
          h('button.btn.btn-ghost', { onclick: () => { savePos(idx); navigate('#/intro/' + code); } }, '← ' + deckTitle(code)),
          h('div.run-progress-label', {}, `${idx + 1} / ${rules.length}`),
        ),
        h('div.progress-track', {}, h('div.progress-fill', { style: `width:${((idx + 1) / rules.length) * 100}%` })),
        h('div.section-context', {}, `${rule.section} · ${posInSection}/${sameSection.length}`),
        h('div.card-surface.intro-card', {},
          contextLine(rule, flagged ? h('span.flag-badge', {}, 'DEL') : null),
          h('div.prompt.prompt-intro', {}, rule.prompt),
          answerBlock(rule),
          froDetails(rule),
        ),
        h('div.run-nav', {},
          h('button.btn', { disabled: idx === 0, onclick: prev }, '← Back'),
          h('button.btn.btn-small' + (flagged ? '' : '.btn-danger-ghost'), { onclick: flagCurrent },
            flagged ? 'Unflag (D)' : 'Flag for deletion (D)'),
          h('button.btn.btn-primary', { onclick: next }, idx === rules.length - 1 ? 'Finish ✓' : 'Next →'),
        ),
      ),
    );
    const card = root.querySelector('.intro-card');
    onSwipe(root.querySelector('.intro-run'), { left: next, right: prev });
    card.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function next() {
    if (idx >= rules.length - 1) { finish(); return; }
    idx++; savePos(idx); draw();
  }
  function prev() { if (idx > 0) { idx--; savePos(idx); draw(); } }

  setKeyHandler(e => {
    if (e.repeat) return true;
    if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') { next(); return true; }
    if (e.key === 'ArrowLeft') { prev(); return true; }
    if (e.key.toLowerCase() === 'd') { flagCurrent(); return true; }
    if (e.key === 'Escape') { savePos(idx); navigate('#/intro/' + code); return true; }
    return false;
  });
  draw();
}
