const CACHE_NAME = 'evconnect-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for shell assets with safe fallbacks
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp;
      return fetch(event.request).catch(() => {
        // If network fails (dev server not serving some path), attempt to return a fallback or nothing
        return new Response('', { status: 504, statusText: 'Gateway Timeout' });
      });
    })
  );
});
