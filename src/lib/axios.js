import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { ENV } from '@/config/env';

// --- INFRAESTRUCTURA OFFLINE (Nativa, sin dependencias extra) ---
const DB_NAME = 'CuadraSyncDB';
const STORE_NAME = 'failed_requests';
const MUTATION_METHODS = ['post', 'put', 'patch', 'delete'];
const pendingMutations = new Map();
const OFFLINE_MESSAGE = 'Sin conexión a internet. Conéctate para continuar.';
const UNSTABLE_CONNECTION_MESSAGE = 'La conexión está inestable. Espera un momento antes de volver a intentar.';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME, { autoIncrement: true });
  request.onsuccess = (e) => resolve(e.target.result);
  request.onerror = (e) => reject(e.target.error);
});

const clearOfflineQueue = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
};

export const processOfflineQueue = async () => {
  try {
    const db = await openDB();

    const requests = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const result = [];
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          result.push({ key: cursor.key, value: cursor.value });
          cursor.continue();
        } else {
          resolve(result);
        }
      };
    });

    if (requests.length === 0) return;

    await clearOfflineQueue();
    console.warn(`[OFFLINE] Se descartaron ${requests.length} acciones pendientes para evitar duplicados en produccion.`);
  } catch (error) {
    console.error('Error al limpiar la cola offline:', error);
  }
};
// ------------------------------------------------------------------

const normalizeForKey = (value) => {
  if (value instanceof FormData) {
    return Array.from(value.entries()).map(([key, fieldValue]) => [
      key,
      fieldValue instanceof File
        ? { name: fieldValue.name, size: fieldValue.size, type: fieldValue.type, lastModified: fieldValue.lastModified }
        : fieldValue
    ]);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForKey);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = normalizeForKey(value[key]);
      return acc;
    }, {});
  }

  return value;
};

const getMutationKey = (config) => {
  const method = config.method?.toLowerCase();
  if (!MUTATION_METHODS.includes(method) || config._isRetry) return null;
  return JSON.stringify({
    method,
    url: config.url,
    data: normalizeForKey(config.data),
  });
};

const createConnectivityError = (message) => {
  const error = new Error(message);
  error.userMessage = message;
  error.response = {
    data: {
      error: message,
      message,
    },
  };
  return error;
};

const normalizeConnectivityError = (error, message) => {
  error.message = message;
  error.userMessage = message;
  error.response = {
    ...(error.response || {}),
    data: {
      ...(error.response?.data || {}),
      error: message,
      message,
    },
  };
  return error;
};

const isConnectivityError = (error) => (
  !error.response &&
  (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')
);

const attachMutationDedupe = (config, mutationKey) => {
  const originalAdapter = config.adapter;

  config.adapter = (adapterConfig) => {
    const inFlight = pendingMutations.get(mutationKey);
    if (inFlight) return inFlight;

    const httpAdapter = axios.getAdapter(originalAdapter || api.defaults.adapter || axios.defaults.adapter);
    const request = Promise.resolve(httpAdapter(adapterConfig))
      .finally(() => {
        pendingMutations.delete(mutationKey);
      });

    pendingMutations.set(mutationKey, request);
    return request;
  };
};

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = useAuthStore.getState().getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(
      `${ENV.API_URL}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    const { accessToken } = response.data;
    if (!accessToken) throw new Error('No access token in refresh response');

    useAuthStore.getState().setToken(accessToken);
    return accessToken;

  } catch (error) {
    console.error('🔴 Fallo el refresh, purgando sesión global');
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?session=expired';
    }
    throw error;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const mutationKey = getMutationKey(config);
    if (mutationKey) {
      if (!navigator.onLine) {
        throw createConnectivityError(OFFLINE_MESSAGE);
      }

      config._mutationKey = mutationKey;
      attachMutationDedupe(config, mutationKey);
    }

    if (ENV.IS_DEV) {
      console.log(`🌐 [${config.method?.toUpperCase()}] ${config.url}`, {
        hasToken: !!token,
        data: config.data,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (ENV.IS_DEV) console.log(`✅ [${response.status}] ${response.config.url}`);
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Intercepción de error de red. Las mutaciones no se encolan para evitar duplicados.
    if (isConnectivityError(error)) {
      const isMutation = MUTATION_METHODS.includes(originalRequest?.method);
      if (isMutation && originalRequest?._allowOfflineQueue) {
        console.warn('[OFFLINE] Mutacion encolable detenida por conexion inestable.');
        return Promise.reject(error);
      }

      if (isMutation && !originalRequest?._isRetry) {
        console.warn('[OFFLINE] Mutacion detenida por conexion inestable.');
        return Promise.reject(normalizeConnectivityError(error, UNSTABLE_CONNECTION_MESSAGE));
      }
      console.error('[OFFLINE] Error de red durante lectura.');
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes('/auth/refresh')) {
        console.error('🔴 Refresh token inválido, cerrando sesión...');
        useAuthStore.getState().logout();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) console.error('🚫 Acceso Denegado - Sin permisos suficientes');
    if (error.response?.status === 500) console.error('🔥 Error Interno del Servidor');

    return Promise.reject(error);
  }
);

export const handleResponse = (response) => response;

export const handleError = (error) => {
  const message = error.response?.data?.message 
    || error.response?.data?.error
    || error.message 
    || 'Error desconocido';
  throw new Error(message);
};

export const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};

export default api;
export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const patch = (url, data, config) => api.patch(url, data, config);
export const del = (url, config) => api.delete(url, config);
