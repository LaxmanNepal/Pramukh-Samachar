
const CACHE_NAME = 'nepali-news-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './templates.js',
  './services.js',
  './constants.js',
  './logo.svg',
  './logo-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Use a "stale-while-revalidate" strategy for API calls and main app files
  if (url.origin === self.location.origin || url.origin.includes('githubusercontent.com') || url.origin.includes('allorigins.win')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // If fetch fails, and we have a cached response, return it.
            // This is for offline support.
            return response;
          });
          // Return cached response immediately if available, and fetch in background
          return response || fetchPromise;
        });
      })
    );
  // Cache-first for images
  } else if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          });
        })
    );
  } else {
    // For all other requests, try network first, then cache.
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus().then(c => {
             // To ensure the URL opens even if the app is already open, we navigate.
             if(c.navigate) {
                 return c.navigate(urlToOpen);
             }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
