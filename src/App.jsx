import { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ToastContainer } from '@/components/notification/toast-container';
import { notify } from '@/components/notification/adaptive-notify';
import {
  OFFLINE_QUEUE_MESSAGES,
  getOfflineQueueNextDelay,
  processOfflineMutationQueue,
} from '@/lib/offline-mutation-queue';

export const App = () => {
  const wasOfflineRef = useRef(!navigator.onLine);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    const scheduleNextRetry = async () => {
      clearRetryTimer();
      const delay = await getOfflineQueueNextDelay().catch(() => null);
      if (delay == null) return;

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        runQueue();
      }, delay);
    };

    const runQueue = async () => {
      try {
        if (!navigator.onLine) return { sent: 0 };
        const result = await processOfflineMutationQueue();
        if (result.sent > 0) {
          notify.success(OFFLINE_QUEUE_MESSAGES.synced);
        }
        return result;
      } finally {
        scheduleNextRetry();
      }
    };

    const handleOnline = () => {
      runQueue().then((result) => {
        window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
        if (result?.sent > 0) return;
        if (wasOfflineRef.current) {
          notify.info('Conexión restablecida.');
        }
      });
      wasOfflineRef.current = false;
    };

    const handleOffline = () => {
      clearRetryTimer();
      wasOfflineRef.current = true;
    };

    const handleFocus = () => {
      runQueue();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') runQueue();
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'CUADRA_SYNC_OFFLINE_QUEUE') runQueue();
    };

    const handleQueueChanged = () => {
      scheduleNextRetry();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('cuadra-offline-queue-changed', handleQueueChanged);
    document.addEventListener('visibilitychange', handleVisibility);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    if (navigator.onLine) {
      runQueue();
    } else {
      scheduleNextRetry();
    }

    return () => {
      clearRetryTimer();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cuadra-offline-queue-changed', handleQueueChanged);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;
