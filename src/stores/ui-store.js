import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set, get) => ({
      sidebarExpanded: true,
      mobileMenuOpen: false,
      badgeCounts: { bandeja: 0, hasOldTickets: false, aprobar: 0 },
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

      setBadgeCounts: (counts) => set({ badgeCounts: counts }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
      }),
    }
  )
);