import api, { handleError, isDefinitiveAuthError, isSessionInvalidError, isTemporaryAuthError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';
import { getCurrentPushEndpoint } from '@/lib/push';

const LOGOUT_BACKEND_TIMEOUT_MS = 3000;
const LOGOUT_TOTAL_TIMEOUT_MS = 3500;

const withLogoutTimeout = (promise) => {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error('El cierre remoto de sesión tardó demasiado.')),
      LOGOUT_TOTAL_TIMEOUT_MS
    );
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
};

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (identifier, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        identifier,
        password,
      });

      // console.log("🌐 1. RESPUESTA CRUDA DE AXIOS:", response);

      // 1. Quitar el wrapper 'data' de JSend si existe
      const payload = response.data || response;

      // 2. AUTO-DESCUBRIMIENTO DEL USUARIO
      let userToSave = payload.user;

      // Si no existe la propiedad 'user', significa que los datos (nombre, imagen, etc) 
      // vienen mezclados en el mismo nivel que la respuesta.
      if (!userToSave) {
        // Extraemos llaves legacy de tokens, y TODO lo demás lo agrupamos en 'userData'
        const { accessToken: _a, refreshToken: _r, token: _t, ...userData } = payload;
        userToSave = userData;
      }

      // console.log("🧠 2. USUARIO QUE SE GUARDARÁ EN ZUSTAND:", userToSave);

      // Barrera de seguridad
      if (!userToSave) {
        throw new Error('El backend no devolvió las credenciales correctamente');
      }

      // Guardar en el store global (Zustand)
      useAuthStore.getState().setAuth(userToSave);

      return payload;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      await withLogoutTimeout((async () => {
        const endpoint = await getCurrentPushEndpoint();
        await api.post('/api/auth/logout', {
          ...(endpoint ? { endpoint } : {}),
        }, {
          timeout: LOGOUT_BACKEND_TIMEOUT_MS,
        });
      })());

      useAuthStore.getState().logout();
      window.location.href = '/login';
    } catch (error) {
      if (isSessionInvalidError(error) || isDefinitiveAuthError(error) || error?.response?.status === 400) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }

      if (isTemporaryAuthError(error) || error.message?.includes('tardó demasiado')) {
        throw new Error('No fue posible cerrar sesión porque el servidor no está disponible. Intenta nuevamente.');
      }

      console.error('Error al notificar logout al backend', error);
      throw new Error('No fue posible cerrar sesión. Intenta nuevamente.');
    }
  },

  /**
   * Obtener perfil actual
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      const payload = response.data || response;
      // Actualizamos Zustand por si cambiaron foto/nombre
      useAuthStore.getState().setAuth(payload.data || payload);
      return payload;
    } catch (error) {
      handleError(error);
    }
  },
};
