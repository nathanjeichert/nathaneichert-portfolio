# Bar Rules — /study

Self-contained offline-first PWA for drilling California bar essay rule
statements. Lives entirely in `public/study/` (plus `public/study-sw.js` and a
`/study → /study/index.html` rewrite in `next.config.js`); no build step, no
dependencies, nothing else in the site touches it.

Source of truth for the rule content is the "Spaced Repetition Outlines" repo
on Nathan's machine (`Scripts/build_app_data.py` builds `rules.json`).

## Updating the rule bundle (after deletions/edits upstream)

1. In the outlines repo: `python Scripts/build_app_data.py`
2. Copy `App/data/rules.json` → `public/study/rules.json` (this repo)
3. Commit + push to `main` — Cloud Build redeploys automatically.
   No service-worker version bump needed: the SW revalidates `rules.json` in
   the background and shows a "Rule bundle updated — reload" toast.
   Card progress is keyed by rule ID and survives bundle swaps.

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
