import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export const OFFLINE_QUEUE_MESSAGES = {
  single: 'Sin conexión. Guardamos la solicitud y se enviará automáticamente cuando vuelva la red.',
  batch: (count) => `Sin conexión. Guardamos las ${count} tareas y se enviarán automáticamente cuando vuelva la red.`,
  savedFailed: 'No fue posible guardar la información. Inténtalo nuevamente.',
  imagesNeedConnection: 'Esta solicitud tiene imágenes. Necesitas conexión a internet para enviarla.',
  synced: 'Listo. Se enviaron las tareas pendientes.',
};

export const QUEUE_STATES = {
  PENDING: 'PENDING',
  SENDING: 'SENDING',
  REQUIRES_AUTH: 'REQUIRES_AUTH',
  REQUIRES_REVIEW: 'REQUIRES_REVIEW',
};

export const QUEUE_OPERATIONS = {
  CREATE_TICKET: 'CREATE_TICKET',
  CREATE_TICKETS_BATCH: 'CREATE_TICKETS_BATCH',
};

const DB_NAME = 'CuadraInternalOfflineMutations';
const DB_VERSION = 1;
const STORE_NAME = 'mutations';
const LOCK_KEY = 'cuadra-internal-offline-queue-lock';
const LOCK_TTL = 30_000;
const MAX_ATTEMPTS = 8;
const MAX_RETRY_DELAY = 5 * 60 * 1000;

const ALLOWLIST = {
  [QUEUE_OPERATIONS.CREATE_TICKET]: { method: 'POST', endpoint: '/api/tickets' },
  [QUEUE_OPERATIONS.CREATE_TICKETS_BATCH]: { method: 'POST', endpoint: '/api/tickets/batch' },
};

const nowIso = () => new Date().toISOString();

const getCurrentUserId = () => {
  const user = useAuthStore.getState().user;
  return user?.data?.id ?? user?.id ?? null;
};

const generateId = () => {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const openQueueDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      store.createIndex('state', 'state', { unique: false });
      store.createIndex('userId', 'userId', { unique: false });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }
  };
  request.onsuccess = (event) => resolve(event.target.result);
  request.onerror = (event) => reject(event.target.error);
});

const withStore = async (mode, callback) => {
  const db = await openQueueDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let result;
    try {
      result = callback(store);
    } catch (error) {
      reject(error);
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = (event) => reject(event.target.error);
    tx.onabort = (event) => reject(event.target.error);
  }).finally(() => db.close());
};

const getAllItems = async () => {
  const db = await openQueueDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
};

const hasBlobPayload = (payload) => {
  if (payload instanceof FormData) {
    return Array.from(payload.values()).some((value) => value instanceof File || value instanceof Blob);
  }
  return false;
};

const serializePayload = (payload) => {
  if (payload instanceof FormData) {
    if (hasBlobPayload(payload)) {
      throw new Error(OFFLINE_QUEUE_MESSAGES.imagesNeedConnection);
    }
    return {
      type: 'FormData',
      entries: Array.from(payload.entries()).map(([key, value]) => [key, String(value)]),
    };
  }
  return { type: 'json', value: payload ?? null };
};

const deserializePayload = (payload) => {
  if (payload?.type === 'FormData') {
    const formData = new FormData();
    payload.entries.forEach(([key, value]) => formData.append(key, value));
    return formData;
  }
  return payload?.value ?? null;
};

const isTransportError = (error) => (
  !error?.response &&
  (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK' || error?.code === 'ECONNABORTED')
);

const validateAllowedOperation = ({ operation, method, endpoint }) => {
  const allowed = ALLOWLIST[operation];
  if (!allowed || allowed.method !== method.toUpperCase() || allowed.endpoint !== endpoint) {
    throw new Error('Operación no permitida para envío sin conexión.');
  }
};

const notifyQueueChanged = () => {
  window.dispatchEvent(new CustomEvent('cuadra-offline-queue-changed'));
};

export const registerOfflineMutationSync = async () => {
  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('cuadra-offline-mutations');
    }
  } catch (error) {
    console.warn('[OFFLINE_QUEUE] Background Sync no disponible:', error?.message || error);
  }
};

export const enqueueAllowedMutation = async ({
  operation,
  method,
  endpoint,
  payload,
  headers = {},
  idempotencyKey,
  itemCount = 1,
}) => {
  validateAllowedOperation({ operation, method, endpoint });
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Sesión requerida para guardar la solicitud.');

  const item = {
    localId: generateId(),
    idempotencyKey,
    userId,
    operation,
    method: method.toUpperCase(),
    endpoint,
    payload: serializePayload(payload),
    headers,
    itemCount,
    state: QUEUE_STATES.PENDING,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    attempts: 0,
    lastError: null,
    nextAttemptAt: null,
    group: operation === QUEUE_OPERATIONS.CREATE_TICKETS_BATCH ? idempotencyKey : null,
    dependencies: [],
  };

  await withStore('readwrite', (store) => store.add(item));
  notifyQueueChanged();
  registerOfflineMutationSync();
  return {
    outcome: 'queued',
    localId: item.localId,
    idempotencyKey: item.idempotencyKey,
    itemCount: item.itemCount,
  };
};

export const sendOrQueueMutation = async ({
  operation,
  method,
  endpoint,
  payload,
  headers = {},
  itemCount = 1,
}) => {
  const idempotencyKey = generateId();

  if (!navigator.onLine) {
    try {
      return await enqueueAllowedMutation({ operation, method, endpoint, payload, headers, idempotencyKey, itemCount });
    } catch (error) {
      if (error?.message === OFFLINE_QUEUE_MESSAGES.imagesNeedConnection) throw error;
      throw new Error(OFFLINE_QUEUE_MESSAGES.savedFailed);
    }
  }

  try {
    const data = await api.request({
      url: endpoint,
      method,
      data: payload,
      headers: { ...headers, 'Idempotency-Key': idempotencyKey },
      _allowOfflineQueue: true,
    });
    return { outcome: 'created', data };
  } catch (error) {
    if (isTransportError(error)) {
      try {
        return await enqueueAllowedMutation({ operation, method, endpoint, payload, headers, idempotencyKey, itemCount });
      } catch (queueError) {
        if (queueError?.message === OFFLINE_QUEUE_MESSAGES.imagesNeedConnection) throw queueError;
        throw new Error(OFFLINE_QUEUE_MESSAGES.savedFailed);
      }
    }
    throw error;
  }
};

const acquireLock = () => {
  const now = Date.now();
  const existing = Number(localStorage.getItem(LOCK_KEY) || 0);
  if (existing && existing > now) return false;
  localStorage.setItem(LOCK_KEY, String(now + LOCK_TTL));
  return true;
};

const releaseLock = () => {
  localStorage.removeItem(LOCK_KEY);
};

const markItem = (item, patch) => withStore('readwrite', (store) => {
  store.put({ ...item, ...patch, updatedAt: nowIso() });
});

const deleteItem = (localId) => withStore('readwrite', (store) => {
  store.delete(localId);
});

const getQueueItemsForCurrentUser = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const items = await getAllItems();
  return items
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const shouldAttempt = (item) => {
  if (item.state === QUEUE_STATES.SENDING) {
    return Date.now() - new Date(item.updatedAt || item.createdAt).getTime() > LOCK_TTL;
  }
  if (item.state !== QUEUE_STATES.PENDING) return false;
  if (!item.nextAttemptAt) return true;
  return new Date(item.nextAttemptAt).getTime() <= Date.now();
};

const getNextAttemptAt = (attempts) => {
  const retryDelays = [5_000, 15_000, 30_000, 60_000, 120_000, MAX_RETRY_DELAY];
  const delay = retryDelays[Math.min(Math.max(attempts - 1, 0), retryDelays.length - 1)];
  return new Date(Date.now() + delay).toISOString();
};

export const getOfflineQueueNextDelay = async () => {
  if (!navigator.onLine) return null;

  const lockExpiresAt = Number(localStorage.getItem(LOCK_KEY) || 0);
  if (lockExpiresAt > Date.now()) {
    return Math.min(MAX_RETRY_DELAY, lockExpiresAt - Date.now());
  }

  const items = await getQueueItemsForCurrentUser();
  const retryableItems = items.filter((item) => (
    item.state === QUEUE_STATES.PENDING ||
    (item.state === QUEUE_STATES.SENDING && Date.now() - new Date(item.updatedAt || item.createdAt).getTime() > LOCK_TTL)
  ));

  if (retryableItems.length === 0) return null;

  const nextAt = retryableItems.reduce((min, item) => {
    if (item.state === QUEUE_STATES.SENDING) return Math.min(min, Date.now());
    if (!item.nextAttemptAt) return Math.min(min, Date.now());
    return Math.min(min, new Date(item.nextAttemptAt).getTime());
  }, Number.POSITIVE_INFINITY);

  return Math.min(MAX_RETRY_DELAY, Math.max(0, nextAt - Date.now()));
};

export const processOfflineMutationQueue = async () => {
  if (!navigator.onLine || !acquireLock()) return { sent: 0, requiresAuth: 0, requiresReview: 0 };

  let sent = 0;
  let requiresAuth = 0;
  let requiresReview = 0;

  try {
    const items = await getQueueItemsForCurrentUser();

    for (const item of items) {
      if (!shouldAttempt(item)) continue;

      const sendingItem = {
        ...item,
        state: QUEUE_STATES.SENDING,
        attempts: (item.attempts || 0) + 1,
        lastError: null,
      };
      await markItem(item, sendingItem);

      try {
        await api.request({
          url: item.endpoint,
          method: item.method,
          data: deserializePayload(item.payload),
          headers: { ...item.headers, 'Idempotency-Key': item.idempotencyKey },
          _allowOfflineQueue: true,
        });
        await deleteItem(item.localId);
        sent += item.itemCount || 1;
      } catch (error) {
        if (error?.response?.status === 401) {
          await markItem(sendingItem, {
            state: QUEUE_STATES.REQUIRES_AUTH,
            lastError: 'AUTH_REQUIRED',
          });
          requiresAuth += item.itemCount || 1;
          break;
        }

        if (error?.response?.status === 409) {
          const code = error.response?.data?.code;

          if (code === 'IDEMPOTENCY_IN_PROGRESS') {
            await markItem(sendingItem, {
              state: QUEUE_STATES.PENDING,
              lastError: 'IDEMPOTENCY_IN_PROGRESS',
              nextAttemptAt: getNextAttemptAt(sendingItem.attempts),
            });
            break;
          }

          await markItem(sendingItem, {
            state: QUEUE_STATES.REQUIRES_REVIEW,
            lastError: code || error.response?.data?.message || error.response?.data?.error || 'REQUIRES_REVIEW',
          });
          requiresReview += item.itemCount || 1;
          continue;
        }

        if (isTransportError(error)) {
          await markItem(sendingItem, {
            state: QUEUE_STATES.PENDING,
            lastError: 'NETWORK',
            nextAttemptAt: getNextAttemptAt(sendingItem.attempts),
          });
          break;
        }

        await markItem(sendingItem, {
          state: sendingItem.attempts >= MAX_ATTEMPTS ? QUEUE_STATES.REQUIRES_REVIEW : QUEUE_STATES.PENDING,
          lastError: error?.response?.data?.message || error?.message || 'ERROR',
          nextAttemptAt: getNextAttemptAt(sendingItem.attempts),
        });
      }
    }
  } finally {
    releaseLock();
    notifyQueueChanged();
  }

  if (sent > 0) {
    window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
  }

  return { sent, requiresAuth, requiresReview };
};

export const getOfflineQueueSummary = async () => {
  const items = await getQueueItemsForCurrentUser();
  const pendingItems = items.filter((item) => [QUEUE_STATES.PENDING, QUEUE_STATES.SENDING].includes(item.state));
  return {
    count: pendingItems.length,
    itemCount: pendingItems.reduce((acc, item) => acc + (item.itemCount || 1), 0),
  };
};
