/**
 * Service Worker for PWA
 * Cache-first strategy for static assets
 */

const CACHE_NAME = 'phd-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/app-icon-192.svg',
  '/assets/icons/app-icon-512.svg',
  '/assets/icons/favicon.svg',
  '/js/main.js',
  '/js/router.js',
  '/css/base/tokens.css',
  '/css/base/typography.css',
  '/css/layout/shell.css',
  '/css/layout/grid.css',
  '/css/components/app-card.css',
  '/css/components/bottom-nav.css',
  '/css/components/fab.css',
  '/css/components/modal.css',
  '/css/components/calendar.css',
  '/css/components/badge.css',
  '/css/components/checklist.css',
  '/css/components/toast.css',
  '/css/components/progress.css',
  '/css/components/filter-bar.css',
  '/css/screens/dashboard.css',
  '/css/screens/applications.css',
  '/css/screens/calendar.css',
  '/css/screens/detail.css',
  '/css/screens/settings.css',
  '/css/themes/light.css',
  '/css/themes/dark.css',
  '/js/utils/constants.js',
  '/js/services/storage.js',
  '/js/services/app-service.js',
  '/js/services/calendar-service.js',
  '/js/services/stats-service.js',
  '/js/components/BottomNav.js',
  '/js/components/Toast.js',
  '/js/components/Fab.js',
  '/js/screens/DashboardScreen.js',
  '/js/screens/ApplicationsScreen.js',
  '/js/screens/CalendarScreen.js',
  '/js/screens/SettingsScreen.js',
  '/js/screens/DetailScreen.js'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Install failed:', err);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            return null;
          });
      })
  );
});

/**
 * Push notification event (for future use)
 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'PhD Application Tracker';
  const options = {
    body: data.body || 'You have a notification',
    icon: '/assets/icons/app-icon-192.png',
    badge: '/assets/icons/app-icon-192.png',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});