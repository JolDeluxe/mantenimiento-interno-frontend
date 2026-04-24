import { create } from 'zustand';

/**
 * Store ligero solo para el conteo de no leídas.
 * Alimentado por DashboardLayout en mount y decrementado localmente al leer.
 */
export const useNotifyStore = create((set) => ({
  noLeidas: 0,
  setNoLeidas: (n) => set({ noLeidas: n }),
  increment: () => set((s) => ({ noLeidas: s.noLeidas + 1 })),
  decrement: () => set((s) => ({ noLeidas: Math.max(0, s.noLeidas - 1) })),
  reset: () => set({ noLeidas: 0 }),
}));