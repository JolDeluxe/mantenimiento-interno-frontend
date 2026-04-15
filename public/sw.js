// ⚠️ VERSIÓN 2: Obligatorio para purgar el caché envenenado (error 404 de Netlify)
const CACHE_NAME = 'cuadra-cache-v2';
const DYNAMIC_CACHE = 'cuadra-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/02_Cuadra_C_Logo.webp',
  '/img/img-pwa/android/launchericon-192x192.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        // Elimina las versiones anteriores (v1) para limpiar la basura
        keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Excluir extensiones de Chrome y peticiones no GET
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // 1. Estrategia: Network First para API (Única fuente de verdad)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // 2. 🛡️ REGLA SPA (Navegación): Evita el 404 offline
  // Si navegas a /tickets o /usuarios, busca en la red. Si falla, sirve el index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Estrategia: Stale-While-Revalidate para Assets y UI (Carga rápida)
  event.respondWith(staleWhileRevalidateStrategy(request));
});

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    
    // Fallback JSON si la API falla y no hay caché
    return new Response(
      JSON.stringify({ error: true, message: "Modo sin conexión. Datos no disponibles." }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}