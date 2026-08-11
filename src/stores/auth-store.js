import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAllSnapshots } from '@/lib/idb';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authStatus: 'CHECKING',

      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
          authStatus: 'AUTHENTICATED',
        });
      },

      setAuthChecking: () => set({ authStatus: 'CHECKING' }),

      setAuthTemporarilyUnavailable: () => set({ authStatus: 'TEMPORARILY_UNAVAILABLE' }),

      setUnauthenticated: () => set({
        user: null,
        isAuthenticated: false,
        authStatus: 'UNAUTHENTICATED',
      }),

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
          isAuthenticated: false,
          authStatus: 'UNAUTHENTICATED',
      });
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
  },

      getUser: () => get().user,
      isAuth: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage', 
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        user: persistedState?.user ?? null,
        isAuthenticated: Boolean(persistedState?.isAuthenticated && persistedState?.user),
        authStatus: persistedState?.isAuthenticated && persistedState?.user
          ? 'AUTHENTICATED'
          : 'CHECKING',
      }),
    }
  )
);
