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

export const MATRIX_VIEW_MODES = [
    { value: 'mes', label: 'Mes' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'anual', label: 'Año' },
];

export const TRIMESTRES_MATRIZ = [
    { key: '1', label: 'Trimestre 1', months: ['1', '2', '3'] },
    { key: '2', label: 'Trimestre 2', months: ['4', '5', '6'] },
    { key: '3', label: 'Trimestre 3', months: ['7', '8', '9'] },
    { key: '4', label: 'Trimestre 4', months: ['10', '11', '12'] },
];

export const getCurrentQuarter = () => String(Math.floor(new Date().getMonth() / 3) + 1);

export const getVisibleMonths = ({ mode, month, quarter }) => {
    if (mode === 'mes') {
        return MESES_MATRIZ.filter((mes) => mes.key === String(month));
    }
    if (mode === 'trimestre') {
        const trimestre = TRIMESTRES_MATRIZ.find((item) => item.key === String(quarter)) || TRIMESTRES_MATRIZ[0];
        return MESES_MATRIZ.filter((mes) => trimestre.months.includes(mes.key));
    }
    return MESES_MATRIZ;
};

export const formatDDMM = (fecha) => {
    if (!fecha) return '--';
    const [year, month, day] = String(fecha).split('-');
    if (!year || !month || !day) return fecha;
    return `${day}/${month}`;
};

export const executionStatusClass = (estado = '') => {
    const value = String(estado).toUpperCase();
    if (value === 'RESUELTO' || value === 'CERRADO') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (value === 'REALIZADO_EN_MES') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (value === 'REALIZADO_FUERA_DEL_MES') return 'border-orange-200 bg-orange-50 text-orange-700';
    if (value === 'PENDIENTE_DEL_MES') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (value === 'SIN_MANTENIMIENTO_REGISTRADO') return 'border-slate-200 bg-slate-100 text-slate-700';
    if (value === 'PROGRAMADO_POR_RECURRENCIA') return 'border-sky-200 bg-sky-50 text-sky-700';
    if (value === 'ASIGNADA') return 'border-blue-200 bg-blue-50 text-blue-700';
    if (value === 'EN_PROGRESO') return 'border-violet-200 bg-violet-50 text-violet-700';
    if (value === 'EN_PAUSA') return 'border-slate-200 bg-slate-100 text-slate-600';
    if (value === 'PENDIENTE') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (value === 'ATRASADO') return 'border-red-200 bg-red-50 text-red-700';
    if (value === 'IMPRESO') return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    return 'border-slate-200 bg-slate-50 text-slate-600';
};

export const executionStatusLabel = (estado = '') => {
    const value = String(estado || '').toUpperCase();
    if (value === 'RESUELTO' || value === 'CERRADO') return 'Resuelto';
    if (value === 'REALIZADO_EN_MES') return 'Realizado en el mes';
    if (value === 'REALIZADO_FUERA_DEL_MES') return 'Realizado fuera del mes';
    if (value === 'PENDIENTE_DEL_MES') return 'Pendiente del mes';
    if (value === 'SIN_MANTENIMIENTO_REGISTRADO') return 'Sin mantenimiento registrado';
    if (value === 'PROGRAMADO_POR_RECURRENCIA') return 'Programado por recurrencia';
    if (value === 'ASIGNADA') return 'Asignada';
    if (value === 'EN_PROGRESO') return 'En progreso';
    if (value === 'EN_PAUSA') return 'Pausada';
    if (value === 'PENDIENTE') return 'Pendiente';
    if (value === 'ATRASADO') return 'Pendiente';
    if (value === 'IMPRESO') return 'Impreso';
    return value || 'Sin estado';
};

export const originLabel = (origen = '') => (
    String(origen).toLowerCase() === 'ticket' ? 'Mantenimiento existente' : 'Programado por recurrencia'
);

export const summarizeExecutions = (ejecuciones = []) => {
    const total = ejecuciones.length;
    const reales = ejecuciones.filter((item) => item.origen === 'ticket' || item.ticketId).length;
    const proyecciones = ejecuciones.filter((item) => item.origen !== 'ticket' && !item.ticketId).length;
    const pendientesGenerar = ejecuciones.filter((item) => item.pendienteMaterializar && !item.ticketId).length;

    return {
        total,
        reales,
        proyecciones,
        pendientesGenerar,
    };
};

export const normalizeMeses = (meses = {}) =>
    Object.fromEntries(MESES_MATRIZ.map((mes) => [mes.key, Array.isArray(meses?.[mes.key]) ? meses[mes.key] : []]));
