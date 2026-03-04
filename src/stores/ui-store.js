import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarExpanded: true,
      mobileMenuOpen: false,

      toggleSidebar: () => set((state) => ({ 
        sidebarExpanded: !state.sidebarExpanded 
      })),

      setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),

      openMobileMenu: () => set({ mobileMenuOpen: true }),
      
      closeMobileMenu: () => set({ mobileMenuOpen: false }),

      toggleMobileMenu: () => set((state) => ({ 
        mobileMenuOpen: !state.mobileMenuOpen 
      })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
      }),
    }
  )
);