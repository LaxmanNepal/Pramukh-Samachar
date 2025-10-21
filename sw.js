// Define cache names and limits. Incrementing versions to ensure update.
const SHELL_CACHE_NAME = 'nepali-news-shell-v5';
const DYNAMIC_CACHE_NAME = 'nepali-news-dynamic-v3';
const MAX_DYNAMIC_CACHE_ITEMS = 100; // Store up to 100 articles/images

// List of app shell files. These are essential for the app's structure.
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/templates.js',
  '/services.js',
  '/constants.js',
  '/manifest.json',
  '/public/logo.svg',
  '/public/logo-192.png',
  '/public/logo-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// --- Helper Function for Cache Management ---

/**
 * Deletes the oldest entries in a cache until the number of items is below a specified limit.
 * @param {string} cacheName The name of the cache to trim.
 * @param {number} maxItems The maximum number of items allowed in the cache.
 */
const trimCache = (cacheName, maxItems) => {
    caches.open(cacheName).then(cache => {
        return cache.keys().then(keys => {
            if (keys.length > maxItems) {
                // Delete the oldest items (FIFO)
                const itemsToDelete = keys.slice(0, keys.length - maxItems);
                console.log(`Trimming cache '${cacheName}'. Deleting ${itemsToDelete.length} items.`);
                return Promise.all(itemsToDelete.map(key => cache.delete(key)));
            }
        });
    });
};

// --- Service Worker Event Listeners ---

// INSTALL: Cache the app shell for offline functionality.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        // Use addAll with a catch to prevent a single failed asset from breaking the entire cache
        return cache.addAll(urlsToCache.map(url => new Request(url, { mode: 'no-cors' }))).catch(err => {
            console.warn("Couldn't cache all shell assets:", err);
        });
      })
  );
});

// ACTIVATE: Clean up old caches to save space and avoid conflicts.
self.addEventListener('activate', event => {
  const cacheWhitelist = [SHELL_CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH: Intercept network requests to serve content from cache or network.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: Dynamic Content (API calls for news feeds, and images)
  // Use a "stale-while-revalidate" strategy with cache trimming.
  // This provides content fast from the cache while updating it in the background.
  if (url.origin.includes('githubusercontent.com') || url.hostname.includes('allorigins.win') || url.hostname.includes('corsproxy.io') || request.destination === 'image') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // If fetch is successful, cache the new response and trim the cache.
            cache.put(request, networkResponse.clone());
            trimCache(DYNAMIC_CACHE_NAME, MAX_DYNAMIC_CACHE_ITEMS);
            return networkResponse;
          }).catch(err => {
              // If fetch fails and there's no cached response, it will fail, which is okay.
              // We could return a placeholder image here if we had one.
              console.warn(`Fetch failed for ${request.url}`, err);
          });
          // Return the cached response immediately if it exists, otherwise wait for the fetch to complete.
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
  // Strategy 2: App Shell & other assets
  // Use a "cache-first" strategy. If it's in the cache, serve it.
  // If not, fetch from the network. This is for the core app files.
  else {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(networkResponse => {
            // Optionally, cache other assets as they are requested
            // Be careful not to cache everything, e.g., third-party scripts you don't control.
            return networkResponse;
        });
      })
    );
  }
});


// NOTIFICATION CLICK: Handle user interaction with notifications.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          // If a window is already open, focus it and navigate to the article URL.
          return client.focus().then(c => c.navigate(urlToOpen));
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});