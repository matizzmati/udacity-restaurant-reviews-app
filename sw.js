const staticCache = 'restaurant-static-v1';
const dynamicCache = 'restaurant-dynamic-v1';

const files = [
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'css/styles.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(staticCache)
      .then((cache) => {
        cache.addAll([
          '/',
          ...files
        ]);
      }).catch(() => {
        console.log('Error caching static assets!');
      })
  );
});

self.addEventListener('activate', (event) => {
  if (self.clients && clients.claim) {
    clients.claim();
  }
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('mws-stage1-') && cacheName !== staticCache;
        })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then((response) => {
      return response || fetch(event.request)
        .then((fetchResponse) => {
          return caches.open(dynamicCache)
            .then((cache) => {
              cache.put(event.request.url, fetchResponse.clone());
              return fetchResponse;
            });
        });
    })
  );
});