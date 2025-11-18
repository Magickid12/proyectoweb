const CACHE_NAME = 'evconnect-shell-v3';
const RUNTIME_CACHE = 'evconnect-runtime-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/logo.png',
  '/icons/favicon.svg',
  '/icons/favicon-96x96.png',
  '/icons/favicon.ico',
  '/offline.html'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL);
    }).catch((error) => {
      console.error('[SW] Failed to cache app shell:', error);
    })
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Helper to determine navigation requests
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept') && 
          request.headers.get('accept').includes('text/html'));
}

// Helper to determine if request is for API
function isApiRequest(url) {
  return url.includes('/api/') || url.includes('evconnect-3ydy.onrender.com');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Strategy 1: Navigation requests - Network first, fallback to cache, then offline page
  if (isNavigationRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Clone and cache successful navigation responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache, then to offline page
          return caches.match(req).then((cached) => {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Strategy 2: API requests - Network only (don't cache dynamic data)
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(req).catch(() => {
        // Return a custom offline response for API failures
        return new Response(
          JSON.stringify({ 
            error: 'Sin conexión',
            message: 'No se pudo conectar con el servidor'
          }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Strategy 3: Static assets - Cache first, then network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Return cached version and update in background
        fetch(req).then((response) => {
          if (response && response.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(req, response);
            });
          }
        }).catch(() => {});
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(req).then((response) => {
        // Cache successful GET requests for static assets
        if (req.method === 'GET' && response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Fallback for failed requests
        return caches.match('/offline.html').then((offline) => {
          return offline || new Response('', { status: 504 });
        });
      });
    })
  );
});
