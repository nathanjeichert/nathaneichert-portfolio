// Applies theme (light/sepia/dark), text scale, line spacing, and fast-reading
// mode to the document root, and mirrors them into localStorage so the
// pre-render inline script in index.html can restore them without a flash.

import { setBionic } from './bionic.js';

let mql = null;
let latest = null;

const THEME_COLOR = { light: '#4338ca', sepia: '#7a5c33', dark: '#101014' };

export const TEXT_SCALE_MIN = 80;
export const TEXT_SCALE_MAX = 150;

export function applyAppearance(settings) {
  const root = document.documentElement;
  const mode = settings.theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;
  root.dataset.theme = mode;

  const scale = Math.max(TEXT_SCALE_MIN, Math.min(TEXT_SCALE_MAX, Number(settings.textScale) || 100)) / 100;
  root.style.setProperty('--txt', String(scale));
  root.dataset.spacing = settings.lineSpacing || 'normal';
  if (settings.bionic) root.dataset.bionic = '';
  else delete root.dataset.bionic;
  setBionic(!!settings.bionic);

  try {
    localStorage.setItem('barrules.theme-hint', mode);
    localStorage.setItem('barrules.appearance-hint', JSON.stringify({
      txt: scale, spacing: root.dataset.spacing, bionic: !!settings.bionic,
    }));
  } catch { /* default stands */ }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLOR[mode] || THEME_COLOR.light);

  if (!mql) {
    mql = matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      // re-read the live settings object captured on the last call
      if (latest) applyAppearance(latest);
    });
  }
  latest = settings;
}
