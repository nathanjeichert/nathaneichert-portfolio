// Service worker for Bar Rules (nathaneichert.com/study).
// Lives at the site root so its scope can cover /study (no trailing slash).
//
// Strategy:
//   - App shell (html/js/css/icons/manifest): precached, cache-first.
//     Bump VERSION whenever any app file changes — that installs a fresh
//     cache and the page offers a one-tap reload.
//   - rules.json: stale-while-revalidate. A regenerated bundle (rule deletions
//     upstream) is picked up in the background even without a VERSION bump;
//     clients get a "rules-updated" message and show a reload toast.

const VERSION = 'v1';
const CACHE = 'barrules-' + VERSION;

const SHELL = [
  '/study',
  '/study/index.html',
  '/study/manifest.webmanifest',
  '/study/css/styles.css',
  '/study/js/main.js',
  '/study/js/constants.js',
  '/study/js/types.js',
  '/study/js/store.js',
  '/study/js/data.js',
  '/study/js/state.js',
  '/study/js/scheduler.js',
  '/study/js/app.js',
  '/study/js/audio.js',
  '/study/js/ui.js',
  '/study/js/keyboard.js',
  '/study/js/theme.js',
  '/study/js/cardview.js',
  '/study/js/views/home.js',
  '/study/js/views/drill.js',
  '/study/js/views/intro.js',
  '/study/js/views/browse.js',
  '/study/js/views/stats.js',
  '/study/js/views/settings.js',
  '/study/icon-192.png',
  '/study/icon-512.png',
  '/study/icon-maskable-512.png',
  '/study/apple-touch-icon.png',
  '/study/rules.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('barrules-') && n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function notifyClients(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const c of clients) c.postMessage(msg);
}

async function staleWhileRevalidateRules(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match('/study/rules.json');
  const fetchAndUpdate = (async () => {
    try {
      const fresh = await fetch(request);
      if (!fresh || !fresh.ok) return null;
      if (cached) {
        const [a, b] = await Promise.all([cached.clone().text(), fresh.clone().text()]);
        if (a !== b) {
          await cache.put('/study/rules.json', fresh.clone());
          notifyClients({ type: 'rules-updated' });
        }
      } else {
        await cache.put('/study/rules.json', fresh.clone());
      }
      return fresh;
    } catch { return null; }
  })();
  if (cached) return cached;
  const fresh = await fetchAndUpdate;
  return fresh || Response.error();
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  // Normalize navigations anywhere under /study to the cached shell.
  const url = new URL(request.url);
  const isNav = request.mode === 'navigate';
  const key = isNav ? '/study' : url.pathname;
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok && url.pathname.startsWith('/study')) {
      cache.put(key, fresh.clone());
    }
    return fresh;
  } catch (err) {
    if (isNav) {
      const shell = await cache.match('/study');
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/study')) return;

  if (url.pathname === '/study/rules.json') {
    event.respondWith(staleWhileRevalidateRules(req));
  } else {
    event.respondWith(cacheFirst(req));
  }
});
