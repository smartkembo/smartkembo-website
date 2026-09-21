// SmartKembo AI — Service Worker Ndogo
// Kazi yake ni MOJA TU: kutimiza masharti ya "installability" ya PWA
// (Chrome inahitaji service worker yenye "fetch" handler ili ionyeshe
// "Install app"). HAIHIFADHI (cache) chochote kwa makusudi — majibu ya AI
// yanahitaji kuwa ya papo hapo kila wakati, siyo data ya zamani.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
