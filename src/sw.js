import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

// Toma control inmediato de todos los clientes abiertos
clientsClaim();

// vite-plugin-pwa inyecta el manifest real aquí en build
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Soporte para hardReload.js existente en el proyecto
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ── SPA Fallback (crítico para React Router) ──────────────────────────────────
registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/index.html'), {
        denylist: [/^\/api\//],
    })
);

// ── API → NetworkFirst ────────────────────────────────────────────────────────
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'cuadra-api-v1',
        networkTimeoutSeconds: 5,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
        ],
    })
);

// ── Cloudinary → CacheFirst ───────────────────────────────────────────────────
registerRoute(
    ({ url }) => url.hostname.includes('cloudinary.com'),
    new CacheFirst({
        cacheName: 'cuadra-cloudinary-v1',
        plugins: [
            new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
    })
);

// ── Fuentes e imágenes → CacheFirst ──────────────────────────────────────────
registerRoute(
    ({ request }) =>
        request.destination === 'font' || request.destination === 'image',
    new CacheFirst({
        cacheName: 'cuadra-static-v1',
        plugins: [
            new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
    })
);

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = { title: 'Cuadra Mantenimiento', body: event.data.text() };
    }

    const { title, body, url, icon } = data;

    event.waitUntil(
        self.registration.showNotification(title || 'Cuadra Mantenimiento', {
            body: body || '',
            icon: icon || '/img/img-pwa/android/launchericon-192x192.png',
            badge: '/img/img-pwa/android/launchericon-192x192.png',
            data: { url: url || '/' },
            vibrate: [200, 100, 200],
            requireInteraction: false,
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Si ya hay una ventana con esa ruta, enfocamos en vez de abrir nueva
                for (const client of windowClients) {
                    const clientPath = new URL(client.url).pathname;
                    const targetPath = targetUrl.startsWith('http')
                        ? new URL(targetUrl).pathname
                        : targetUrl;

                    if (clientPath === targetPath && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(targetUrl);
            })
    );
});