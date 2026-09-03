/* Ekoz PWA Service Worker
 * Conservador de propósito: garante instalabilidade e um fallback offline
 * do app shell, SEM arriscar servir dados velhos. Nunca intercepta /api nem
 * o socket.io — esses são sempre rede direta. Os assets do Vite têm hash no
 * nome, então cache-first neles é seguro (deploy novo = nome novo). */

const CACHE = 'ekoz-shell-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/pwa-192.png', '/pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca mexe em API, websocket ou origens externas (fontes, etc.)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // Navegações (troca de página / abertura do app): rede primeiro, com
  // fallback pro index.html cacheado quando estiver offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r || fetch(request))),
    );
    return;
  }

  // Assets estáticos com hash (JS/CSS/imagens): cache-first, revalidando em
  // segundo plano pra manter atualizado sem bloquear a renderização.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
