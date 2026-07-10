export const MESES_MATRIZ = [
    { key: '1', label: 'Enero', short: 'Ene' },
    { key: '2', label: 'Febrero', short: 'Feb' },
    { key: '3', label: 'Marzo', short: 'Mar' },
    { key: '4', label: 'Abril', short: 'Abr' },
    { key: '5', label: 'Mayo', short: 'May' },
    { key: '6', label: 'Junio', short: 'Jun' },
    { key: '7', label: 'Julio', short: 'Jul' },
    { key: '8', label: 'Agosto', short: 'Ago' },
    { key: '9', label: 'Septiembre', short: 'Sep' },
    { key: '10', label: 'Octubre', short: 'Oct' },
    { key: '11', label: 'Noviembre', short: 'Nov' },
    { key: '12', label: 'Diciembre', short: 'Dic' },
];

export const ESTADOS_BAJA = new Set(['BAJA', 'BAJA_ERP', 'DESUSO', 'INACTIVA']);

export const formatDDMM = (fecha) => {
    if (!fecha) return '--';
    const [year, month, day] = String(fecha).split('-');
    if (!year || !month || !day) return fecha;
    return `${day}/${month}`;
};

export const executionStatusClass = (estado = '') => {
    const value = String(estado).toUpperCase();
    if (value === 'RESUELTO' || value === 'CERRADO') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (value === 'ASIGNADA') return 'border-blue-200 bg-blue-50 text-blue-700';
    if (value === 'EN_PROGRESO') return 'border-violet-200 bg-violet-50 text-violet-700';
    if (value === 'EN_PAUSA') return 'border-slate-200 bg-slate-100 text-slate-600';
    if (value === 'PENDIENTE') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (value === 'ATRASADO') return 'border-red-200 bg-red-50 text-red-700';
    if (value === 'IMPRESO') return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    return 'border-slate-200 bg-slate-50 text-slate-600';
};

export const normalizeMeses = (meses = {}) =>
    Object.fromEntries(MESES_MATRIZ.map((mes) => [mes.key, Array.isArray(meses?.[mes.key]) ? meses[mes.key] : []]));
