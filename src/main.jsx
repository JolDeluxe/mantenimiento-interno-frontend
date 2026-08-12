import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const UPDATE_CHECK_COOLDOWN_MS = 5 * 60 * 1000;
const SAFE_AUTO_UPDATE_PATHS = new Set(['/', '/login', '/sso-receiver']);
const SW_AUTO_NAVIGATING_KEY = 'cuadra-sw-auto-navigating-at';
const ROUTE_CHANGE_EVENT = 'cuadra-route-change';

const normalizePath = (pathname = window.location.pathname) =>
  pathname.replace(/\/+$/, '') || '/';

const isSafeAutoUpdatePath = () => SAFE_AUTO_UPDATE_PATHS.has(normalizePath());

const markSwAutoNavigating = () => {
  try {
    sessionStorage.setItem(SW_AUTO_NAVIGATING_KEY, String(Date.now()));
  } catch {
    // Si storage no esta disponible, el SW sigue controlando la navegacion segura.
  }
};

const patchHistoryForUpdateReady = () => {
  const dispatchRouteChange = () => window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));

  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method];
    history[method] = function patchedHistoryMethod(...args) {
      const result = original.apply(this, args);
      dispatchRouteChange();
      return result;
    };
  });

  window.addEventListener('popstate', dispatchRouteChange);
};

// En producción, vite-plugin-pwa genera este módulo virtual
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let registration;
  let swUrlValue;
  let lastUpdateCheck = 0;
  let updateCheckInFlight = false;
  let updatePending = false;
  let documentNavigationStarted = false;

  const navigateOnceForPendingUpdate = () => {
    if (!updatePending || documentNavigationStarted || !isSafeAutoUpdatePath()) return;

    updatePending = false;
    documentNavigationStarted = true;
    window.location.assign(window.location.href);
  };

  const markUpdatePending = () => {
    updatePending = true;
    queueMicrotask(navigateOnceForPendingUpdate);
  };

  const checkForUpdate = async ({ force = false } = {}) => {
    if (!registration || !swUrlValue || updateCheckInFlight || !navigator.onLine) return;

    const now = Date.now();
    if (!force && now - lastUpdateCheck < UPDATE_CHECK_COOLDOWN_MS) return;

    lastUpdateCheck = now;
    updateCheckInFlight = true;

    try {
      const resp = await fetch(swUrlValue, {
        cache: 'no-store',
        headers: { cache: 'no-store', 'cache-control': 'no-cache' },
      });
      if (resp?.status === 200) await registration.update();
    } catch {
      // Best effort: si el update check falla, la app continua normal.
    } finally {
      updateCheckInFlight = false;
    }
  };

  const handleServiceWorkerMessage = (event) => {
    if (event.data?.type === 'CUADRA_SW_UPDATE_READY' && event.data?.autoNavigating) {
      markSwAutoNavigating();
    }

    if (event.data?.type === 'CUADRA_SW_UPDATE_READY' && event.data?.safeToAutoNavigate === false) {
      markUpdatePending();
    }
  };

  const handleControllerChange = () => {
    // El SW nuevo decide si navega una ruta segura; React no recarga para evitar doble reload.
  };

  const handleForegroundUpdateCheck = () => {
    checkForUpdate();
  };

  const handleVisibilityUpdateCheck = () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  };

  navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
  window.addEventListener('pageshow', handleForegroundUpdateCheck);
  window.addEventListener('focus', handleForegroundUpdateCheck);
  document.addEventListener('visibilitychange', handleVisibilityUpdateCheck);
  window.addEventListener(ROUTE_CHANGE_EVENT, navigateOnceForPendingUpdate);
  patchHistoryForUpdateReady();

  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onNeedReload() {
        markSwAutoNavigating();
      },
      onRegisteredSW(swUrl, r) {
        registration = r;
        swUrlValue = swUrl;
        checkForUpdate({ force: true });

        // Respaldo de baja frecuencia; los checks principales son foreground/focus.
        setInterval(async () => {
          await checkForUpdate();
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
