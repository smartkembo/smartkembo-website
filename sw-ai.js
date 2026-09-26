// SmartKembo AI — Service Worker
// v3: PWA installable, lakini HAISHIKILII chat/API/POST/domain nyingine.
// Badilisha faili hii kwenye root ya website (sawa na ai.html).

const SW_VERSION = 'sk-ai-sw-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Chat hutuma POST /api/chat/stream — usishike kabisa
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  // Backend ya Render na domain nyingine — usishike
  if (url.origin !== self.location.origin) return;

  // API yoyote — usishike
  if (url.pathname.indexOf('/api/') === 0) return;

  event.respondWith(fetch(req));
});
