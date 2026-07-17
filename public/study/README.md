# Bar Rules — /study

Self-contained offline-first PWA for drilling California bar essay rule
statements. Lives entirely in `public/study/` (plus `public/study-sw.js` and a
`/study → /study/index.html` rewrite in `next.config.js`); no build step, no
dependencies, nothing else in the site touches it.

Source of truth for the rule content is the "Spaced Repetition Outlines" repo
on Nathan's machine (`Scripts/build_app_data.py` builds `rules.json`;
`Scripts/build_fro_data.py --deploy` builds and copies `fro.json` + the
`fro/*.png` figure images).

## Data files

- `rules.json` — the 806 rule cards (prompt, core, prose, skeletons, weights).
- `fro.json` — verbatim Themis Final Review Outline excerpts: `sections`
  (id → title/breadcrumb/page/html) + `map` (rule id → section ids). Shown
  beside the rule in a second column on wide screens (drill reveal, intro
  walkthrough, browse detail), as a collapsible block below it on narrow
  screens. Loaded lazily; the app works without it.
- `fro/*.png` — flowchart/figure images referenced from section html.

## Updating the data bundles (after deletions/edits upstream)

1. In the outlines repo: `python Scripts/build_app_data.py`, then
   `python Scripts/build_fro_data.py --deploy` (the latter copies `fro.json`
   and figures into this repo itself; copy `rules.json` by hand).
2. Commit + push to `main` — Cloud Build redeploys automatically.
   No service-worker version bump needed: the SW revalidates both json bundles
   in the background (`rules.json` shows a reload toast; `fro.json` updates
   silently). Card progress is keyed by rule ID and survives bundle swaps.

## Updating app code

Any change to files under `public/study/` (html/js/css/icons) **must bump
`VERSION` in `public/study-sw.js`**, or installed clients will keep serving
the old cached shell forever.

## Architecture notes

- Vanilla ES modules, hash routing, no framework. Entry: `js/main.js`.
- All scheduler tuning constants: `js/constants.js`.
- Reading comfort (Settings → Appearance): three themes (light / sepia
  "paper" / dark), a global 80–150% text-size stepper, line-spacing presets,
  and a fast-reading ("bionic") mode. `js/theme.js` applies them all to the
  root element (`data-theme`/`data-spacing`/`data-bionic` + the `--txt` scale
  factor) and mirrors them to localStorage for the no-flash pre-paint script
  in `index.html`. `js/bionic.js` does the word-prefix bolding with a
  MutationObserver — wrappers are inert spans, active only under
  `html[data-bionic]`, so no framework or font dependency is involved.
- Old profiles/backups with `textSize` (s/m/l/xl) are converted to the numeric
  `textScale` by `migrateSettings()` in `js/app.js`.
- Storage: IndexedDB (`barrules` db: append-only review `log` + `kv`),
  localStorage fallback. Undo appends a tombstone; history is never mutated.
- The service worker is at the public root (`/study-sw.js`) so its scope can
  cover `/study` without a trailing slash (Next.js 308s `/study/` → `/study`).
