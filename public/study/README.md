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
  beside every revealed answer (drill), and as a collapsible block in
  intro/browse. Loaded lazily; the app works without it.
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
- Storage: IndexedDB (`barrules` db: append-only review `log` + `kv`),
  localStorage fallback. Undo appends a tombstone; history is never mutated.
- The service worker is at the public root (`/study-sw.js`) so its scope can
  cover `/study` without a trailing slash (Next.js 308s `/study/` → `/study`).
