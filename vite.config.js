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
        registerType: 'autoUpdate',
        filename: 'sw.js',
        injectManifest: false,

        workbox: {
          // 🔥 Permite archivos grandes (como fonts)
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,

          // 🔥 Qué archivos se cachean en precache
          globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2,svg}'],

          // 🔥 Ignorar basura o archivos pesados innecesarios
          globIgnores: [
            '**/node_modules/**/*',
            'sw.js',
            '**/MaterialSymbolsRounded*.woff2',
          ],

          // 🔥 Limpia caches viejos automáticamente
          cleanupOutdatedCaches: true,

          // 🔥 Activación inmediata del SW
          skipWaiting: true,
          clientsClaim: true,

          // 🔥 Manejo de rutas SPA offline (CRÍTICO)
          navigateFallback: '/index.html',
          navigateFallbackAllowlist: [/./],
          navigateFallbackDenylist: [/^\/api\//],

          // 🔥 Estrategias de cache dinámico
          runtimeCaching: [
            {
              // API → intenta red, si falla usa cache
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
                  maxAgeSeconds: 60 * 60 * 24, // 24 horas
                },
              },
            },
            {
              // Cloudinary → cache fuerte
              urlPattern: ({ url }) => url.hostname.includes('cloudinary.com'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'cuadra-cloudinary-v1',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
                },
              },
            },
            {
              // Imágenes y fuentes → cache fuerte
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
        },

        // 🔥 Usas manifest externo
        manifest: false,

        // 🔥 Assets adicionales a incluir
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