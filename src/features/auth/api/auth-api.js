import api, { handleError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

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

      // 2. Extraer tokens (soporta que se llame accessToken o token)
      const accessToken = payload.accessToken || payload.token;
      const refreshToken = payload.refreshToken;

      // 3. AUTO-DESCUBRIMIENTO DEL USUARIO
      let userToSave = payload.user;

      // Si no existe la propiedad 'user', significa que los datos (nombre, imagen, etc) 
      // vienen mezclados en el mismo nivel que los tokens.
      if (!userToSave) {
        // Extraemos los tokens, y TODO lo demás lo agrupamos en 'userData'
        const { accessToken: _a, refreshToken: _r, token: _t, ...userData } = payload;
        userToSave = userData;
      }

      // console.log("🧠 2. USUARIO QUE SE GUARDARÁ EN ZUSTAND:", userToSave);

      // Barrera de seguridad
      if (!userToSave || !accessToken) {
        throw new Error('El backend no devolvió las credenciales correctamente');
      }

      // Guardar en el store global (Zustand)
      useAuthStore.getState().setAuth(userToSave, accessToken, refreshToken);

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
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        await api.post('/api/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error al notificar logout al backend', error);
    } finally {
      useAuthStore.getState().logout();
      window.location.href = '/login';
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
      const currentAuth = useAuthStore.getState();
      useAuthStore.getState().setAuth(payload, currentAuth.token, currentAuth.refreshToken);
      return payload;
    } catch (error) {
      handleError(error);
    }
  },
};