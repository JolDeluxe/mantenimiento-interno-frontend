import { create } from 'zustand';

export const useTicketsUiStore = create((set) => ({
    unassignedCount: 0,
    setUnassignedCount: (n) => set({ unassignedCount: n }),
}));