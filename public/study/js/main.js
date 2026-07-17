// Boot: load data + persisted state, wire the router and keyboard, register
// the service worker, surface update/backup toasts.

import { loadData, loadFro, daysToExam } from './data.js';
import { initStore } from './store.js';
import { App, loadPersisted } from './app.js';
import { h, clear, toast } from './ui.js';
import { initKeyboard } from './keyboard.js';
import { applyAppearance } from './theme.js';
import { initBionic } from './bionic.js';
import { EXPORT_REMINDER } from './constants.js';
import { renderHome } from './views/home.js';
import { renderDrill } from './views/drill.js';
import { renderIntroList, renderIntroMap, renderIntroRun } from './views/intro.js';
import { renderBrowse } from './views/browse.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';

const view = document.getElementById('view');

function navigate(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

const NAV = [
  ['#/home', 'Home'],
  ['#/drill', 'Drill'],
  ['#/intro', 'Intro'],
  ['#/browse', 'Browse'],
  ['#/stats', 'Stats'],
  ['#/settings', 'Settings'],
];

function drawHeader(active) {
  const header = document.getElementById('appbar');
  clear(header).append(
    h('a.brand', { href: '#/home' }, '§ Bar Rules'),
    h('nav.tabs', {}, NAV.map(([href, label]) =>
      h('a.tab' + (active === href.slice(2).split('/')[0] ? '.active' : ''), { href }, label))),
    h('span.countdown-chip', { title: 'days until the exam' }, daysToExam() + 'd'),
  );
}

function route() {
  const parts = (location.hash || '#/home').slice(2).split('/');
  const [name, arg, sub] = parts;
  drawHeader(name || 'home');
  window.scrollTo(0, 0);
  switch (name) {
    case 'drill': renderDrill(view, navigate); break;
    case 'intro':
      if (arg && sub === 'run') renderIntroRun(view, navigate, arg);
      else if (arg) renderIntroMap(view, navigate, arg);
      else renderIntroList(view, navigate);
      break;
    case 'browse': renderBrowse(view, navigate, arg && sub ? arg + '/' + sub : arg); break;
    case 'stats': renderStats(view, navigate); break;
    case 'settings': renderSettings(view, navigate); break;
    default: renderHome(view, navigate);
  }
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/study-sw.js', { scope: '/study' }).then(reg => {
    // App-shell update flow: new SW installed while one is active -> offer reload.
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('App updated', {
            actionLabel: 'Reload', sticky: true,
            action: () => { nw.postMessage({ type: 'SKIP_WAITING' }); },
          });
        }
      });
    });
  }).catch(err => console.warn('SW registration failed', err));

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    location.reload();
  });

  // Rules-bundle update (SW revalidates rules.json in the background).
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'rules-updated') {
      toast('Rule bundle updated', { actionLabel: 'Reload', sticky: true, action: () => location.reload() });
    }
  });
}

function exportReminder() {
  const revs = App.reviews.length;
  if (!revs) return;
  const last = App.meta.lastExport || 0;
  const since = revs - (App.meta.reviewsAtExport || 0);
  const daysSince = (Date.now() - last) / 86400000;
  if (since >= EXPORT_REMINDER.minReviews && (!last || daysSince >= EXPORT_REMINDER.days)) {
    toast('Progress lives only in this browser — export a backup', {
      actionLabel: 'Settings', duration: 6000,
      action: () => navigate('#/settings'),
    });
  }
}

async function boot() {
  try {
    await loadData();
  } catch (err) {
    clear(view).append(h('div.empty-state', {},
      h('h1', {}, 'Couldn’t load the rule bundle'),
      h('p.dim', {}, String(err)),
      h('button.btn.btn-primary', { onclick: () => location.reload() }, 'Retry'),
    ));
    return;
  }
  loadFro();   // FRO excerpts load in the background; views pick them up when ready
  await initStore();
  await loadPersisted();
  initBionic();
  applyAppearance(App.settings);
  initKeyboard(navigate);
  window.addEventListener('hashchange', route);
  route();
  registerSW();
  setTimeout(exportReminder, 1500);
}

boot();
