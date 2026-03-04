import api, { handleError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export const profileService = {
  /**
   * Obtener perfil actual y sincronizar la foto/departamento con Zustand
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      
      // 1. Desenvolvemos el JSend del backend { status: 'success', data: { ... } }
      const fullProfile = response.data?.data || response.data || response;
      
      const currentAuth = useAuthStore.getState();
      
      // 2. Sincronizamos silenciosamente el estado global con los datos completos
      if (currentAuth.token && fullProfile) {
        // Mantenemos los tokens intactos, pero sobreescribimos el 'user' con la info rica
        useAuthStore.getState().setAuth(
          fullProfile, 
          currentAuth.token, 
          currentAuth.refreshToken
        );
      }
      
      return fullProfile;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * (Futuro) Actualizar datos del perfil
   */
};