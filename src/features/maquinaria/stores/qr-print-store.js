import { create } from 'zustand';

export const useQrPrintStore = create((set) => ({
  selectedMaquinas: [],
  isPrintMode: false,
  loadedQrIds: [],

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
      loadedQrIds: [],
    })),

  // Marca un QR como cargado (llamado por cada QrCodeCard al terminar de cargar su imagen)
  markQrLoaded: (id) =>
    set((state) =>
      state.loadedQrIds.includes(id)
        ? state
        : { loadedQrIds: [...state.loadedQrIds, id] }
    ),

  // Reinicia el contador de QR cargados (al entrar a la página de impresión o cambiar selección)
  resetLoadedQr: () =>
    set(() => ({ loadedQrIds: [] })),
}));