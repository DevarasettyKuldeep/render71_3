const CACHE = 'render72-v1';
const URLS = ['/','/index.html','/manifest.webmanifest','/favicon.svg','/og.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(URLS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
