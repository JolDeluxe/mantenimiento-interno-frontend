// frontend/src/lib/axios.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { ENV } from '@/config/env';

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
    // Usamos Zustand como única fuente de verdad
    const refreshToken = useAuthStore.getState().getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${ENV.API_URL}/api/auth/refresh`,
      { refreshToken },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 
      }
    );

    const { accessToken } = response.data;

    if (!accessToken) {
      throw new Error('No access token in refresh response');
    }

    // Actualizamos solo el estado, Zustand se encarga de la persistencia
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
    if (ENV.IS_DEV) {
      console.log(`✅ [${response.status}] ${response.config.url}`);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

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

    if (error.response?.status === 403) {
      console.error('🚫 Acceso Denegado - Sin permisos suficientes');
    }

    if (error.response?.status === 500) {
      console.error('🔥 Error Interno del Servidor');
    }

    if (!error.response) {
      console.error('📡 Error de Red - Backend no disponible');
    }

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