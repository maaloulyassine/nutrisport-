// ===== Service Worker for Offline Support =====

const CACHE_NAME = 'nutrisport-v1';
const urlsToCache = [
  '/html/index.html',
  '/html/goals.html',
  '/html/food-diary.html',
  '/html/chatbot.html',
  '/html/settings.html',
  '/html/login.html',
  '/html/signup.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/goals.js',
  '/js/food-diary.js',
  '/js/chatbot.js',
  '/js/settings.js',
  '/js/login.js',
  '/js/signup.js',
  '/js/dark-mode.js',
  '/js/food-database.js',
  '/js/achievements.js',
  '/js/statistics.js',
  '/js/export.js',
  '/js/mini-chatbot.js',
  '/js/notifications.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // Return a custom offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/html/index.html');
            }
          });
      })
  );
});

// Handle background sync for offline meal logging
self.addEventListener('sync', event => {
  if (event.tag === 'sync-meals') {
    event.waitUntil(syncMeals());
  }
});

async function syncMeals() {
  // Placeholder for future offline meal syncing
  console.log('Syncing offline meals...');
}

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'NutriSport';
  const options = {
    body: data.body || 'Notification de NutriSport',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/html/index.html'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
