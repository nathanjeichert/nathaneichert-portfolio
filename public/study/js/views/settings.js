// Settings: appearance, session behavior, feedback, data in/out, danger zone.

import { h, clear, toast, confirmDialog, download } from '../ui.js';
import { setKeyHandler } from '../keyboard.js';
import { bundle, deckCodes, deckTitle, rulesById } from '../data.js';
import {
  App, saveSettings, saveFlags, saveMeta, loadPersisted, migrateSettings,
} from '../app.js';
import { getLog, replaceAll, wipeAll } from '../store.js';
import { applyAppearance, TEXT_SCALE_MIN, TEXT_SCALE_MAX } from '../theme.js';
import { SESSION_LENGTH_CHOICES, BREAK_REMINDER_CHOICES } from '../constants.js';

const EXPORT_VERSION = 1;

export function buildExport() {
  return {
    app: 'barrules',
    version: EXPORT_VERSION,
    exported: new Date().toISOString(),
    bundle: { generated: bundle.generated, schema_version: bundle.schema_version },
    log: getLog(),
    tierOverrides: App.tierOverrides,
    deleteFlags: [...App.flags],
    introProgress: App.introProgress,
    settings: App.settings,
  };
}

export function deletionExportText() {
  const ids = [...App.flags].sort();
  const date = new Date().toISOString().slice(0, 10);
  return `# App delete-flags exported ${date}\n${ids.join(', ')}\n`;
}

export function renderSettings(root, navigate) {
  const s = App.settings;

  const row = (label, control, note) => h('div.set-row', {},
    h('div.set-label', {}, h('span', {}, label), note ? h('span.set-note.dim', {}, note) : null),
    h('div.set-control', {}, control),
  );

  const toggle = (key, onChange) => h('button.switch' + (s[key] ? '.on' : ''), {
    role: 'switch', 'aria-checked': String(!!s[key]),
    onclick: async e => {
      const btn = e.currentTarget;   // capture before await — null afterwards
      s[key] = !s[key];
      btn.classList.toggle('on', s[key]);
      btn.setAttribute('aria-checked', String(!!s[key]));
      if (onChange) onChange();
      await saveSettings();
    },
  }, h('span.knob'));

  const segmented = (key, values, onChange) => h('div.segmented', {},
    values.map(([v, label]) => h('button.seg' + (s[key] === v ? '.active' : ''), {
      onclick: async e => {
        const btn = e.currentTarget;   // capture before await — null afterwards
        s[key] = v;
        btn.parentElement.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (onChange) onChange();
        await saveSettings();
      },
    }, label)));

  async function importFile(file) {
    let data;
    try { data = JSON.parse(await file.text()); }
    catch { toast('Not a valid JSON file'); return; }
    if (data.app !== 'barrules' || !Array.isArray(data.log)) { toast('Not a Bar Rules export file'); return; }
    migrateSettings(data.settings);   // backups from older app versions carry old keys
    const ok = await confirmDialog(
      `Replace all local progress with this export from ${data.exported?.slice(0, 10) || 'unknown date'} (${data.log.length} log entries)?`,
      { yes: 'Import & replace', danger: true });
    if (!ok) return;
    await replaceAll(data.log, {
      settings: { ...App.settings, ...data.settings },
      tierOverrides: data.tierOverrides || {},
      deleteFlags: data.deleteFlags || [],
      introProgress: data.introProgress || {},
      meta: { ...App.meta, lastExport: Date.now(), reviewsAtExport: data.log.length },
    });
    await loadPersisted();
    applyAppearance(App.settings);
    toast('Import complete');
    renderSettings(root, navigate);
  }

  const flaggedIds = [...App.flags].sort();

  clear(root).append(
    h('section.settings', {},
      h('h1', {}, 'Settings'),

      h('h2', {}, 'Appearance'),
      row('Theme', segmented('theme', [['system', 'System'], ['light', 'Light'], ['sepia', 'Sepia'], ['dark', 'Dark']], () => applyAppearance(s)),
        'Sepia is a warm paper tone — easiest on the eyes for long sessions'),
      row('Text size', (() => {
        const val = h('span.stepper-val', {}, (s.textScale || 100) + '%');
        const set = async delta => {
          s.textScale = Math.max(TEXT_SCALE_MIN, Math.min(TEXT_SCALE_MAX, (Number(s.textScale) || 100) + delta));
          val.textContent = s.textScale + '%';
          applyAppearance(s);
          await saveSettings();
        };
        return h('div.stepper', {},
          h('button.btn.btn-small', { 'aria-label': 'Smaller text', onclick: () => set(-5) }, 'A−'),
          val,
          h('button.btn.btn-small', { 'aria-label': 'Larger text', onclick: () => set(+5) }, 'A+'),
        );
      })(), `Scales all app text (${TEXT_SCALE_MIN}–${TEXT_SCALE_MAX}%)`),
      row('Line spacing', segmented('lineSpacing', [['normal', 'Normal'], ['relaxed', 'Relaxed'], ['loose', 'Loose']], () => applyAppearance(s))),
      row('Fast reading', toggle('bionic', () => applyAppearance(s)),
        'Bolds the first part of each word in rule & outline text to guide the eye'),

      h('h2', {}, 'Sessions'),
      row('Session length', segmented('sessionLength', SESSION_LENGTH_CHOICES), '∞ keeps serving cards until you stop'),
      row('Scheduling', segmented('scheduling', [['continuous', 'Continuous'], ['spaced', 'Spaced']]),
        'Continuous always serves the highest-value card; Spaced waits out review intervals'),
      row('Subject filter', h('select.filter-sel', {
        onchange: async e => { s.subjectFilter = e.target.value; await saveSettings(); },
      },
        h('option', { value: '', selected: !s.subjectFilter }, 'All subjects'),
        deckCodes.map(c => h('option', { value: c, selected: s.subjectFilter === c }, deckTitle(c))),
      ), 'Drill sessions draw only from this deck'),
      row('Include T3 cards', toggle('includeT3'), 'Minutiae / duplicates stay out of drills by default'),
      row('Require subject intro', toggle('requireIntro'), 'New cards enter drills only after their deck’s intro'),
      row('Break reminder', segmented('breakEvery', BREAK_REMINDER_CHOICES),
        'A gentle nudge after drilling this long without a pause'),

      h('h2', {}, 'Feedback'),
      row('Sound on grade', toggle('sound')),
      row('Haptics (mobile)', toggle('haptics')),
      row('Daily goal', h('input.num-input', {
        type: 'number', min: '5', max: '500', value: s.dailyGoal,
        onchange: async e => {
          const v = Math.max(5, Math.min(500, Number(e.target.value) || 50));
          s.dailyGoal = v; e.target.value = v;
          await saveSettings();
        },
      }), 'cards per day'),

      h('h2', {}, 'Data'),
      row('Export backup', h('button.btn', {
        onclick: async () => {
          download(`barrules-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildExport()));
          App.meta.lastExport = Date.now();
          App.meta.reviewsAtExport = App.reviews.length;
          await saveMeta();
          toast('Backup downloaded');
        },
      }, 'Download JSON'), 'Progress lives only in this browser — export every few days'),
      row('Import backup', (() => {
        const input = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: e => { if (e.target.files[0]) importFile(e.target.files[0]); e.target.value = ''; } });
        return h('span', {}, input, h('button.btn', { onclick: () => input.click() }, 'Choose file…'));
      })(), 'Replaces all local progress'),
      row('Export deletion list', h('button.btn', {
        disabled: !flaggedIds.length,
        onclick: () => {
          download('deletions-export.txt', deletionExportText(), 'text/plain');
          toast(`${flaggedIds.length} flagged IDs exported — paste into deletions.txt in the source repo`);
        },
      }, flaggedIds.length ? `Download (${flaggedIds.length} flagged)` : 'Nothing flagged'), 'Formatted for the source repo’s deletions.txt'),

      flaggedIds.length ? h('details.flag-details', {},
        h('summary', {}, `Flagged for deletion (${flaggedIds.length})`),
        h('div.flag-list', {}, flaggedIds.map(id => h('div.flag-row', {},
          h('span.ctx-id', {}, id),
          h('span.flag-prompt.dim', {}, rulesById.get(id)?.prompt || '(gone from bundle)'),
          h('button.btn.btn-small', {
            onclick: async e => {
              App.flags.delete(id);
              await saveFlags();
              e.currentTarget.closest('.flag-row').remove();
              toast(`${id} unflagged`);
            },
          }, 'Unflag'),
        ))),
      ) : null,

      h('h2', {}, 'Danger zone'),
      row('Reset all progress', h('button.btn.btn-danger', {
        onclick: async () => {
          const a = await confirmDialog('Erase the entire review log, overrides, flags, intro progress, and settings on this device?', { yes: 'Erase everything', danger: true });
          if (!a) return;
          const b = await confirmDialog('Last check — this cannot be undone (export a backup first?).', { yes: 'Yes, erase', danger: true });
          if (!b) return;
          await wipeAll();
          await loadPersisted();
          applyAppearance(App.settings);
          toast('All progress erased');
          navigate('#/home');
        },
      }, 'Erase…'), 'Consider exporting a backup first'),

      h('p.about.dim', {},
        `Bundle: ${bundle.rules.length} rules · generated ${bundle.generated} · schema v${bundle.schema_version} · exam ${bundle.exam_date}`,
        App.meta.lastExport ? ` · last export ${new Date(App.meta.lastExport).toISOString().slice(0, 10)}` : ' · never exported'),
    ),
  );

  setKeyHandler(e => {
    if (e.key === 'Escape') { navigate('#/home'); return true; }
    return false;
  });
}
