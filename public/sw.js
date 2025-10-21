const CACHE_NAME = 'evconnect-shell-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/src/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/logo.png',
  '/offline.html'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Helper to determine navigation requests
function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Always respond with cached app shell for navigation requests (SPA navigation fallback)
  if (isNavigationRequest(req)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // If navigation fetch succeeds, update the cache with the latest index.html
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => caches.match('/offline.html'));
      })
    );
    return;
  }

  // For other requests: try cache first, then network, else fallback to cache or a 504
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Optionally cache successful GET requests for static assets
        if (req.method === 'GET' && res && res.status === 200 && req.destination !== 'document') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => caches.match('/offline.html').then((f) => f || new Response('', { status: 504 })));
    })
  );
});
