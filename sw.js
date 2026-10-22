const CACHE_NAME = 'munux-admin-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through para chamadas da API
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
