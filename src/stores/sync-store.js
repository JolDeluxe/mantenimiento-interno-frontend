// src/stores/sync-store.js
import { create } from 'zustand';

export const useSyncStore = create((set) => ({
    lastUpdate: Date.now(),
    triggerSync: () => set({ lastUpdate: Date.now() }),
}));