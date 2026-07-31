export const frecuenciaLabel = (regla) => {
    if (!regla) return '-';
    if (regla.frecuencia === 'PERSONALIZADA_DIAS') return `Cada ${regla.intervaloDias || '-'} dias`;
    const labels = {
        SEMANAL: 'Semanal',
        QUINCENAL: 'Quincenal',
        MENSUAL: 'Mensual',
        TRIMESTRAL: 'Trimestral',
    };
    return labels[regla.frecuencia] || regla.frecuencia || '-';
};
