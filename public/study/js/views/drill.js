// Drill: the core loop. Prompt (+ optional typed attempt, hint ladder) ->
// reveal (answer + FRO excerpt side by side, optional second go) ->
// grade 1-9 -> immediate advance. Failed cards re-enter a few cards later.

import { h, clear, toast, tierChip, fmtDuration } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, rulesById, onFroReady } from '../data.js';
import { App, gradeCard, undoLast, cycleTier, toggleFlag, isIntroduced } from '../app.js';
import { buildSession, effTier } from '../scheduler.js';
import { recentAvg, streak, reviewsByDay, dayKey } from '../state.js';
import { contextLine, promptBlock, skeletonBlock, answerBlock, froPanel } from '../cardview.js';
import { gradeSound, revealSound, haptic } from '../audio.js';
import { SCHED, GRADE_LABELS, ENDLESS_CHUNK } from '../constants.js';

let preset = null;
/** Stats/Browse can preset the next session (e.g. weakest-cards drill). */
export function setDrillPreset(p) { preset = p; }

function weakestIds(n) {
  return bundle.rules
    .filter(r => !App.flags.has(r.id) && App.cards.has(r.id))
    .sort((a, b) => (recentAvg(App.cards.get(a.id)) ?? 0) - (recentAvg(App.cards.get(b.id)) ?? 0))
    .slice(0, n)
    .map(r => r.id);
}

export function renderDrill(root, navigate) {
  const endless = App.settings.sessionLength === 'endless' && !preset?.onlyIds;
  const sessionOpts = () => ({
    rules: bundle.rules,
    cards: App.cards,
    subjectMean: App.subjectMean,
    tierOverrides: App.tierOverrides,
    flags: App.flags,
    introduced: Object.fromEntries([...new Set(bundle.rules.map(r => r.deck))].map(d => [d, isIntroduced(d)])),
    settings: App.settings,
    length: endless ? ENDLESS_CHUNK : App.settings.sessionLength,
  });
  const label = preset?.label;
  const { queue, nNew, nDue } = buildSession({ ...sessionOpts(), onlyIds: preset?.onlyIds });
  preset = null;
  if (!queue.length) { renderEmpty(root, navigate); return; }

  const session = {
    queue: queue.slice(),
    pos: 0,
    graded: [],            // {id, g, h, wasRequeue}
    startTs: Date.now(),
    lastBreakNudge: Date.now(),
    label,
    nNew, nDue,
  };
  let phase = 'prompt';    // prompt | revealed
  let hints = 0;           // 0 none, 1 bare, 2 guided
  let attempt = '';        // typed answer from the prompt stage (optional)
  let retry = '';          // post-reveal "type it again" box (optional)
  let busy = false;        // guards async actions against key auto-repeat / double-press
  let live = true;         // false once another view takes over the root

  const isMobile = matchMedia('(pointer: coarse)').matches;

  function currentRule() { return rulesById.get(session.queue[session.pos]); }

  // Endless: top the queue back up before it runs dry (excluding what's pending).
  function refill() {
    if (!endless || session.queue.length - session.pos > 3) return;
    const pending = new Set(session.queue.slice(session.pos));
    const more = buildSession({ ...sessionOpts(), excludeIds: pending });
    for (const id of more.queue) if (!pending.has(id)) session.queue.push(id);
  }

  function progressBits() {
    if (!endless) {
      return {
        label: `${session.pos + 1} / ${session.queue.length}`,
        fill: (session.pos / session.queue.length) * 100,
      };
    }
    // Endless sessions fill the bar toward the daily goal instead.
    const today = reviewsByDay(App.reviews).get(dayKey(Date.now())) || 0;
    return {
      label: `${session.graded.length} this session · ∞`,
      fill: Math.min(100, (today / App.settings.dailyGoal) * 100),
    };
  }

  function attemptBox() {
    return h('div.attempt-wrap', {},
      h('div.part-label', {}, 'Your answer (optional)'),
      h('textarea.attempt-input', {
        placeholder: 'Type the rule from memory — or skip straight to Reveal…',
        rows: 3,
        oninput: e => { attempt = e.target.value; },
        onkeydown: e => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); reveal(); }
        },
      }, attempt),
      isMobile ? null : h('div.attempt-hint.dim', {}, 'Ctrl+Enter to reveal · Esc to leave the box'),
    );
  }

  function attemptEcho() {
    if (!attempt.trim()) return null;
    return h('div.attempt-echo', {},
      h('div.part-label', {}, 'Your answer'),
      h('p', {}, attempt),
    );
  }

  function retryBox() {
    return h('div.retry-wrap', {},
      h('details', { open: !!retry },
        h('summary.dim', {}, 'Type it again to lock it in (optional)'),
        h('textarea.attempt-input', {
          placeholder: 'One more rep with the answer in front of you…',
          rows: 3,
          oninput: e => { retry = e.target.value; },
        }, retry),
      ),
    );
  }

  function draw() {
    refill();
    if (session.pos >= session.queue.length) { drawSummary(); return; }
    const rule = currentRule();
    if (!rule) { session.queue.splice(session.pos, 1); draw(); return; }
    const cs = App.cards.get(rule.id);
    const prog = progressBits();
    const revealed = phase === 'revealed';
    const fro = revealed ? froPanel(rule) : null;

    const leftCard = h('div.card-surface.drill-card' + (revealed ? '.revealed' : ''), {
      onclick: revealed ? undefined : e => {
        if (e.target.closest('textarea, button, a, details, summary')) return;
        reveal();
      },
    },
      contextLine(rule, cs
        ? h('span.ctx-seen', {}, `seen ${cs.seen}× · avg ${(recentAvg(cs) ?? 0).toFixed(1)}`)
        : h('span.ctx-new', {}, 'new')),
      promptBlock(rule),
      hints >= 1 && !revealed ? skeletonBlock(rule.bare, 'Bare skeleton') : null,
      hints >= 2 && !revealed ? skeletonBlock(rule.guided, 'Guided skeleton') : null,
      revealed
        ? [attemptEcho(), answerBlock(rule), retryBox()]
        : [attemptBox(),
           h('div.reveal-hint', {}, isMobile ? 'Tap to reveal' : 'Space to reveal · H for a hint')],
    );

    clear(root).append(
      h('section.drill', {},
        h('div.run-head', {},
          h('button.btn.btn-ghost', { onclick: endEarly }, '← End'),
          h('div.run-progress-label', {},
            session.label ? session.label + ' · ' : '',
            prog.label),
        ),
        h('div.progress-track', { title: endless ? 'progress toward daily goal' : '' },
          h('div.progress-fill', { style: `width:${prog.fill}%` })),

        revealed && fro
          ? h('div.reveal-grid', {}, leftCard, h('div.card-surface.fro-card', {}, fro))
          : leftCard,

        phase === 'prompt'
          ? h('div.drill-controls', {},
              h('button.btn', { onclick: takeHint, disabled: hints >= 2 }, hints === 0 ? 'Hint (H)' : hints === 1 ? 'More hint (H)' : 'Hints used'),
              h('button.btn.btn-primary', { onclick: reveal }, 'Reveal (Space)'),
            )
          : h('div.grade-area', {},
              h('div.grade-row', {}, [1, 2, 3, 4, 5, 6, 7, 8, 9].map(g =>
                h('button.grade-btn.' + (g <= 3 ? 'g-low' : g <= 6 ? 'g-mid' : 'g-high'),
                  { onclick: () => grade(g) }, String(g)))),
              h('div.grade-legend', {},
                h('span.g-low-text', {}, '1–3 ' + GRADE_LABELS.low),
                h('span.g-mid-text', {}, '4–6 ' + GRADE_LABELS.mid),
                h('span.g-high-text', {}, '7–9 ' + GRADE_LABELS.high),
              ),
            ),

        h('div.drill-foot.dim', {},
          hints ? h('span.hint-flag', {}, `hints: ${hints} `) : null,
          h('button.btn.btn-danger-ghost.btn-small', { onclick: flag }, 'Flag for deletion' + (isMobile ? '' : ' (D)')),
          isMobile ? null : h('span.foot-keys', {}, 'U undo · T re-tier · ? shortcuts'),
        ),
      ),
    );
    window.scrollTo(0, 0);
  }

  function takeHint() {
    if (phase !== 'prompt' || hints >= 2) return;
    hints++;
    draw();
  }

  function reveal() {
    if (phase !== 'prompt') return;
    phase = 'revealed';
    if (App.settings.sound) revealSound();
    draw();
  }

  async function grade(g) {
    if (phase !== 'revealed' || busy) return;
    busy = true;
    try {
      const rule = currentRule();
      await gradeCard(rule.id, g, hints);
      session.graded.push({ id: rule.id, g, h: hints });
      if (App.settings.sound) gradeSound(g);
      if (App.settings.haptics) haptic(g <= 3 ? [14, 40, 14] : 12);

      // Failed cards re-enter this session a few cards later.
      if (g <= 3) {
        const at = Math.min(session.queue.length, session.pos + 1 + SCHED.RESERVE_GAP);
        session.queue.splice(at, 0, rule.id);
      }
      flashGrade(g);
      session.pos++;
      phase = 'prompt';
      hints = 0;
      attempt = '';
      retry = '';
      draw();
      maybeBreakNudge();
    } finally { busy = false; }
  }

  // Sustained-attention guard: a soft toast after breakEvery minutes of
  // uninterrupted grading (Settings → Break reminder; 0 = off).
  function maybeBreakNudge() {
    const mins = App.settings.breakEvery;
    if (!mins || Date.now() - session.lastBreakNudge < mins * 60000) return;
    session.lastBreakNudge = Date.now();
    toast(`${mins} min straight — micro-break? Stand up, sip water, look far away.`, { duration: 8000 });
  }

  function flashGrade(g) {
    const el = h('div.grade-flash.' + (g <= 3 ? 'g-low' : g <= 6 ? 'g-mid' : 'g-high'), {}, String(g));
    document.body.append(el);
    requestAnimationFrame(() => el.classList.add('go'));
    setTimeout(() => el.remove(), 650);
  }

  async function undo() {
    if (busy) return;
    if (!session.graded.length) { toast('Nothing to undo in this session'); return; }
    busy = true;
    try {
      const lastGraded = session.graded.pop();
      await undoLast();
      // Remove the re-serve copy if the undone grade was a fail.
      if (lastGraded.g <= 3) {
        const i = session.queue.indexOf(lastGraded.id, session.pos);
        if (i >= 0) session.queue.splice(i, 1);
      }
      session.pos = Math.max(0, session.pos - 1);
      // Land back on the undone card, revealed, so he can re-grade.
      session.queue[session.pos] = lastGraded.id;
      phase = 'revealed';
      hints = lastGraded.h;
      attempt = '';
      retry = '';
      toast(`Undid ${lastGraded.id} (was ${lastGraded.g})`);
      draw();
    } finally { busy = false; }
  }

  async function retier() {
    const rule = currentRule();
    const t = await cycleTier(rule.id);
    toast(`${rule.id} → ${t}`);
    draw();
  }

  async function flag() {
    if (busy) return;
    const rule = currentRule();
    const on = await toggleFlag(rule.id);
    if (on) {
      // Hidden immediately: drop this card (and any re-serve copies) from the session.
      session.queue = session.queue.filter((id, i) => i < session.pos || id !== rule.id);
      phase = 'prompt';
      hints = 0;
      attempt = '';
      retry = '';
      toast(`${rule.id} flagged for deletion (Settings → export the list)`, {
        actionLabel: 'Undo',
        action: async () => { await toggleFlag(rule.id); toast(`${rule.id} unflagged`); },
      });
    } else {
      toast(`${rule.id} unflagged`);
    }
    draw();
  }

  function endEarly() {
    if (session.graded.length) drawSummary();
    else navigate('#/home');
  }

  function drawSummary() {
    live = false;
    const g = session.graded;
    const elapsed = Date.now() - session.startTs;
    const avg = g.length ? g.reduce((a, b) => a + b.g, 0) / g.length : 0;
    const worst = g.slice().sort((a, b) => a.g - b.g).slice(0, 5)
      .filter(x => x.g <= 6)
      .map(x => rulesById.get(x.id)).filter(Boolean);
    const stk = streak(App.reviews);

    clear(root).append(
      h('section.summary', {},
        h('h1', {}, 'Session done'),
        h('div.summary-grid', {},
          h('div.stat-tile', {}, h('div.stat-num', {}, String(g.length)), h('div.stat-cap', {}, 'cards')),
          h('div.stat-tile', {}, h('div.stat-num', {}, g.length ? avg.toFixed(1) : '—'), h('div.stat-cap', {}, 'avg grade')),
          h('div.stat-tile', {}, h('div.stat-num', {}, fmtDuration(elapsed)), h('div.stat-cap', {}, 'time')),
          h('div.stat-tile', {}, h('div.stat-num', {}, String(stk)), h('div.stat-cap', {}, 'day streak')),
        ),
        worst.length ? h('div.weak-block', {},
          h('h2', {}, 'Shakiest this session'),
          worst.map(r => h('div.weak-row', {},
            h('span.ctx-id', {}, r.id), ' ', r.prompt,
            tierChip(effTier(r, App.tierOverrides)))),
        ) : null,
        h('div.dialog-row', {},
          h('button.btn', { onclick: () => navigate('#/home') }, 'Home (Esc)'),
          h('button.btn.btn-primary', { onclick: () => renderDrill(root, navigate) }, 'Next session (Enter)'),
        ),
      ),
    );
    setKeyHandler(e => {
      if (e.key === 'Enter') { renderDrill(root, navigate); return true; }
      if (e.key === 'Escape') { navigate('#/home'); return true; }
      return false;
    });
  }

  setKeyHandler(e => {
    if (e.repeat) return true;   // holding a key must not spam grades/undos/flags
    const k = e.key;
    if (k === ' ') { if (phase === 'prompt') reveal(); return true; }
    if (k >= '1' && k <= '9') { grade(Number(k)); return true; }
    if (k.toLowerCase() === 'h') { takeHint(); return true; }
    if (k.toLowerCase() === 'u') { undo(); return true; }
    if (k.toLowerCase() === 't') { retier(); return true; }
    if (k.toLowerCase() === 'd') { flag(); return true; }
    if (k === 'Escape') { endEarly(); return true; }
    return false;
  });
  // If the FRO bundle lands mid-session, surface it on the current reveal.
  onFroReady(() => { if (live && phase === 'revealed' && root.querySelector('.drill')) draw(); });
  draw();
}

function renderEmpty(root, navigate) {
  const anySeen = App.cards.size > 0;
  clear(root).append(
    h('section.empty-state.drill-empty', {},
      h('h1', {}, 'Nothing in the queue'),
      h('p.dim', {}, App.settings.subjectFilter
        ? 'No cards match the current subject filter — its deck may need its intro first (or clear the filter in Settings).'
        : 'No cards are unlocked yet. Intro a subject to bring its cards into the rotation.'),
      h('div.dialog-row', {},
        h('button.btn', { onclick: () => navigate('#/intro') }, 'Subject intros'),
        anySeen ? h('button.btn.btn-primary', {
          onclick: () => {
            const n = typeof App.settings.sessionLength === 'number' ? App.settings.sessionLength : ENDLESS_CHUNK;
            setDrillPreset({ onlyIds: weakestIds(n), label: 'Weakest' });
            renderDrill(root, navigate);
          },
        }, 'Drill weakest cards') : null,
        h('button.btn', { onclick: () => navigate('#/settings') }, 'Settings'),
      ),
    ),
  );
  setKeyHandler(e => {
    if (e.key === 'Escape') { navigate('#/home'); return true; }
    return false;
  });
}
