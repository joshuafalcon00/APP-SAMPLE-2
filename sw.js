// Minimal app-shell cache so the PWA still opens (from a cached copy)
// when the device has no connection. Data itself lives in Firebase,
// which already persists independently of this cache.
const CACHE_NAME = 'mariels-application-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './love-1.jpg',
  './love-2.jpg',
  './love-3.jpg',
  './love-4.jpg',
  './love-5.jpg',
  './love-6.jpg'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for the app shell, falling back to network, then updating
// the cache in the background when a fresher copy comes back.
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      const fetchPromise = fetch(event.request).then(function(networkResponse){
        if(networkResponse && networkResponse.status === 200){
          caches.open(CACHE_NAME).then(function(cache){
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
