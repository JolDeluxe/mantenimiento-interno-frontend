import { create } from 'zustand';

export const useQrPrintStore = create((set) => ({
  selectedMaquinas: [],
  isPrintMode: false,

  togglePrintMode: () =>
    set((state) => ({ isPrintMode: !state.isPrintMode })),

  toggleSelect: (id) =>
    set((state) => {
      const isSelected = state.selectedMaquinas.includes(id);
      return {
        selectedMaquinas: isSelected
          ? state.selectedMaquinas.filter((item) => item !== id)
          : [...state.selectedMaquinas, id],
      };
    }),

  selectAll: (ids) =>
    set(() => ({
      selectedMaquinas: Array.isArray(ids) ? [...ids] : [],
    })),

  clearSelection: () =>
    set(() => ({
      selectedMaquinas: [],
    })),
}));
