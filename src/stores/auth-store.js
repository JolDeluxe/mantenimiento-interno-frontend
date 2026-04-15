import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAllSnapshots } from '@/lib/idb';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setToken: (token) => {
        set({ token });
      },

      setUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser }
        }));
      },

      logout: () => {
      // Limpiar snapshots offline al salir
      clearAllSnapshots().catch(() => {});

      set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
  },

      getUser: () => get().user,
      getToken: () => get().token,
      getRefreshToken: () => get().refreshToken,
      isAuth: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);