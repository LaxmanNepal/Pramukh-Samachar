const CACHE_NAME = 'nepali-news-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  // Note: Add other essential assets here if they are not dynamically loaded
  // e.g., '/logo.svg', '/logo-192.png'
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

  // Stale-while-revalidate for API calls (news feeds)
  if (url.origin.includes('githubusercontent.com') || url.origin.includes('allorigins.win')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
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
    // Network-first for other requests
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

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo-192.png',
    badge: '/logo.svg',
    data: {
      url: data.url, // Pass the article URL
    },
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if a window is already open and focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus().then(c => c.navigate(urlToOpen));
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
