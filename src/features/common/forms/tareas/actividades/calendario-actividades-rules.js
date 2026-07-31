export const calendarioActividadesRules = {
    source: 'calendario',
    scope: 'actividades',
    allowedTipos: ['PLANEADA', 'EXTRAORDINARIA'],
    defaultTipo: 'PLANEADA',
    clasificacion: null,
    enableMaquinaria: false,
    enableRecurrencia: true,
    enableBatch: false,
    enableModoListaDesktop: false,
    enableModoListaMobile: false,
    localStoragePrefix: 'calendario_actividades',
};
