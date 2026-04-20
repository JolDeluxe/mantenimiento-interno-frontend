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
        // Pasamos a injectManifest para poder manejar push nativamente
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',

        injectManifest: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,webp,woff2,svg}'],
          globIgnores: [
            '**/node_modules/**/*',
            'sw.js',
            '**/MaterialSymbolsRounded*.woff2',
          ],
        },

        // Desactiva generación automática del manifest (usamos el externo)
        manifest: false,

        includeAssets: ['img/**/*.webp', 'img/**/*.png'],

        devOptions: {
          // En dev se puede activar para probar el SW localmente si se necesita
          enabled: false,
          type: 'module',
        },
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