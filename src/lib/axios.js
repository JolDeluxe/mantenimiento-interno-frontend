import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { ENV } from '@/config/env';

// --- INFRAESTRUCTURA OFFLINE (Nativa, sin dependencias extra) ---
const DB_NAME = 'CuadraSyncDB';
const STORE_NAME = 'failed_requests';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME, { autoIncrement: true });
  request.onsuccess = (e) => resolve(e.target.result);
  request.onerror = (e) => reject(e.target.error);
});

const saveToOfflineQueue = async (requestConfig) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({
    url: requestConfig.url,
    method: requestConfig.method,
    data: requestConfig.data,
    headers: requestConfig.headers,
    timestamp: Date.now()
  });
};

const processOfflineQueue = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const request = store.getAll();

  request.onsuccess = async () => {
    const requests = request.result;
    if (requests.length === 0) return;

    console.log(`🔄 Sincronizando ${requests.length} peticiones encoladas...`);
    let syncSuccessful = false;

    for (const req of requests) {
      try {
        await api({ ...req, _isRetry: true });
        syncSuccessful = true;
      } catch (err) {
        console.error('Fallo al sincronizar petición encolada:', err);
      }
    }
    
    store.clear();

    // Puente hacia React: Avisar que la BD local se vació y el backend tiene datos nuevos
    if (syncSuccessful) {
      window.dispatchEvent(new CustomEvent('cuadra-sync-complete'));
    }
  };
};
// ------------------------------------------------------------------

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

    // Intercepción de error de red (Modo Offline)
    if (!error.response && error.message === 'Network Error') {
      const isMutation = ['post', 'put', 'patch', 'delete'].includes(originalRequest.method);
      if (isMutation && !originalRequest._isRetry) {
        console.warn('📡 Guardando mutación en cola local (Offline)');
        await saveToOfflineQueue(originalRequest);
        return Promise.reject(new Error('Modo offline: La acción ha sido guardada y se sincronizará automáticamente.'));
      }
      console.error('📡 Error de Red - Backend no disponible');
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