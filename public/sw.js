const CACHE_NAME = 'pydc-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pydc_medical_logo.png'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-first fallback to Cache)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(async () => {
      const cachedResponse = await caches.match(e.request);
      return cachedResponse || new Response('Offline', {
        status: 503,
        statusText: 'Offline'
      });
    })
  );
});
