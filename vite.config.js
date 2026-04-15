import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // 'autoUpdate' detecta nuevo SW e instala sin prompt
        registerType: 'autoUpdate',
        // Genera el SW en dist/sw.js (override al manual en public/)
        filename: 'sw.js',
        // Inyecta manifest dentro del SW generado por Workbox
        injectManifest: false,
        // Workbox genera el SW completamente
        workbox: {
          
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB
          
          // Precachea TODO el build de Vite automáticamente
          globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2,svg}'],
          // No incluir el SW mismo ni el sw.js del public
          globIgnores: ['**/node_modules/**/*', 'sw.js'],

          // ── Estrategias de Runtime ───────────────────────────────────
          runtimeCaching: [
            // API → Network First con fallback a caché
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'cuadra-api-v1',
                networkTimeoutSeconds: 5,
                cacheableResponse: {
                  statuses: [0, 200],
                },
                expiration: {
                  maxEntries: 100,
                  // Datos de API válidos por 24h offline
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
            // Imágenes Cloudinary → Cache First (no cambian)
            {
              urlPattern: ({ url }) => url.hostname.includes('cloudinary.com'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'cuadra-cloudinary-v1',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            // Assets estáticos (fuentes, íconos) → Cache First
            {
              urlPattern: ({ request }) =>
                request.destination === 'font' ||
                request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'cuadra-static-v1',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],

          // Navegación SPA: siempre sirve index.html para rutas desconocidas
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],

          // Skip waiting para activar el SW nuevo inmediatamente
          skipWaiting: true,
          clientsClaim: true,
        },

        // Sobreescribe el manifest inline (ya tienes public/manifest.json)
        manifest: false,
        includeAssets: ['img/**/*.webp', 'img/**/*.png'],
      }),
    ],
    server: {
      host: true,
      port: parseInt(env.PORT) || 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});