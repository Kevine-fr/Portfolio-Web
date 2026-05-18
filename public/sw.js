// Service worker minimal — necessaire pour rendre l'app installable.
// Strategie : network-first, fallback cache pour navigation hors-ligne.
// Volontairement tres simple pour eviter les pieges de cache obsolete.

const CACHE_NAME = 'portfolio-v1';
const OFFLINE_URLS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Ne s'occupe que des GET HTTP/HTTPS
  if (req.method !== 'GET') return;
  if (!req.url.startsWith('http')) return;

  // Toujours laisser passer les requetes API et /version.js
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api') || url.pathname === '/version.js') return;

  // Pour les navigations HTML : network-first
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/').then((r) => r || Response.error()))
    );
    return;
  }

  // Pour les assets : cache-first (hash dans le nom = invalidation auto)
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return resp;
        })
      )
    );
  }
});
