import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

// En producción, vite-plugin-pwa genera este módulo virtual
if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      // Recarga silenciosa cuando hay nueva versión
      onRegisteredSW(swUrl, r) {
        // Polling de actualizaciones cada hora en producción
        setInterval(async () => {
          if (!r.installing && navigator) {
            if ('connection' in navigator && !navigator.onLine) return;
            const resp = await fetch(swUrl, {
              cache: 'no-store',
              headers: { cache: 'no-store', 'cache-control': 'no-cache' },
            });
            if (resp?.status === 200) await r.update();
          }
        }, 60 * 60 * 1000);
      },
      onOfflineReady() {
        console.log('[PWA] App lista para usar offline.');
      },
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);