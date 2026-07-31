export const ticketsActividadesRules = {
    source: 'tickets',
    scope: 'actividades',
    allowedTipos: ['PLANEADA', 'EXTRAORDINARIA'],
    defaultTipo: 'PLANEADA',
    clasificacion: null,
    enableMaquinaria: false,
    enableRecurrencia: true,
    enableBatch: true,
    enableModoListaDesktop: true,
    enableModoListaMobile: false,
    localStoragePrefix: 'tickets_actividades',
};
