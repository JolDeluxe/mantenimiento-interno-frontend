export const frecuenciaLabel = (regla) => {
    if (!regla) return '-';
    if (regla.frecuencia === 'PERSONALIZADA_DIAS') return `Cada ${regla.intervaloDias || '-'} dias`;
    const labels = {
        SEMANAL: 'Semanal',
        QUINCENAL: 'Quincenal',
        MENSUAL: 'Mensual',
    };
    return labels[regla.frecuencia] || regla.frecuencia || '-';
};
