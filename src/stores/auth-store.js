import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAllSnapshots } from '@/lib/idb';

const AUTH_STORAGE_VERSION = 2;

export const clearLegacyAuthResidue = () => {
  try {
    const rawStorage = localStorage.getItem('auth-storage');
    if (rawStorage) {
      const storage = JSON.parse(rawStorage);
      if (storage?.state) {
        delete storage.state.token;
        delete storage.state.accessToken;
        delete storage.state.refreshToken;
        localStorage.setItem('auth-storage', JSON.stringify(storage));
      }
    }
  } catch {
    // No bloquear el cierre de sesión por storage corrupto.
  }

  ['token', 'accessToken', 'refreshToken', 'user'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      authStatus: 'CHECKING',

      setAuth: (user) => {
        clearLegacyAuthResidue();
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

      resetAuthOnly: () => {
        set({
          user: null,
          isAuthenticated: false,
          authStatus: 'UNAUTHENTICATED',
        });

        clearLegacyAuthResidue();
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
          isAuthenticated: false,
          authStatus: 'UNAUTHENTICATED',
      });
      
      clearLegacyAuthResidue();
  },

      getUser: () => get().user,
      isAuth: () => get().isAuthenticated,
    }),
    {
      name: 'auth-storage', 
      version: AUTH_STORAGE_VERSION,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      migrate: () => {
        clearLegacyAuthResidue();
        return {
          user: null,
          isAuthenticated: false,
        };
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        user: persistedState?.user ?? null,
        isAuthenticated: false,
        authStatus: 'CHECKING',
      }),
    }
  )
);
