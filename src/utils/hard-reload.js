import { clearAllSnapshots } from '@/lib/idb';

export const hardReload = async () => {
  const isOffline = !navigator.onLine;

  if (isOffline) {
    console.warn('⚠️ Hard reload cancelado: estás offline');
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
          setTimeout(resolve, 800);
        });
      }
    } catch {
      // Best effort: si falla el SW, seguimos limpiando caches locales.
    }
  }

  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      // Best effort: el navegador puede negar acceso a Cache Storage.
    }
  }

  try {
    await clearAllSnapshots();
  } catch {
    // Best effort: si IndexedDB falla, la recarga de página continúa.
  }

  window.location.reload();
};
