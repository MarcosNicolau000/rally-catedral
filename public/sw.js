// =====================================================
// Service Worker — Sistema Rally PWA
// =====================================================
// Caches apenas de assets estáticos (CSS, JS, Fonts).
// Lançamentos e operações de escrita EXIGEM conexão ativa.
// =====================================================

const CACHE_NAME = 'rally-static-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/globals.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições POST/PUT/DELETE, rotas de API internas (/api/) e chamadas diretas ao Supabase
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase.co')
  ) {
    return;
  }


  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Se offline e for uma navegação de página, retorna o cache da home se disponível
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        })
      );
    })
  );
});
