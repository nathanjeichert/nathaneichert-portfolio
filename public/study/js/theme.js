// Applies theme + text size to the document root.

let mql = null;

export function applyAppearance(settings) {
  const root = document.documentElement;
  const mode = settings.theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;
  root.dataset.theme = mode;
  root.dataset.size = settings.textSize || 'm';
  // Hint for the pre-render inline script in index.html (avoids theme flash).
  try { localStorage.setItem('barrules.theme-hint', mode); } catch { /* fine */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#101014' : '#4338ca');

  if (!mql) {
    mql = matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      // re-read the live settings object captured on first call
      applyAppearance(latest);
    });
  }
  latest = settings;
}

let latest = null;
