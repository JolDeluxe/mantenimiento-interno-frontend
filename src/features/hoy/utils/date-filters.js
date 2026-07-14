export const HOY_VISTAS = {
    ACTIVAS: 'activas',
    MES: 'mes',
    HOY: 'hoy',
    MANANA: 'manana',
    SEMANA: 'semana',
};

export const getDefaultHoyVista = (scope = 'general') => (
    scope === 'mantenimientos' ? HOY_VISTAS.MES : HOY_VISTAS.ACTIVAS
);

export const puedeFiltrarAtrasadasRechazadas = (vistaActiva) => (
    vistaActiva === HOY_VISTAS.ACTIVAS || vistaActiva === HOY_VISTAS.MES
);

export const getHoyVistaOptions = (scope = 'general') => {
    const primera = scope === 'mantenimientos'
        ? { id: HOY_VISTAS.MES, label: 'Todos', icon: 'list_alt' }
        : { id: HOY_VISTAS.ACTIVAS, label: 'Todas las activas', icon: 'task_alt' };

    return [
        primera,
        { id: HOY_VISTAS.HOY, label: 'Hoy', icon: 'today' },
        { id: HOY_VISTAS.MANANA, label: 'Mañana', icon: 'event' },
        { id: HOY_VISTAS.SEMANA, label: 'Esta semana', icon: 'date_range' },
    ];
};

export const buildHoyDateParams = (vistaActiva, scope = 'general') => {
    const vista = vistaActiva || getDefaultHoyVista(scope);
    return { vista };
};

export const getHoyPeriodoLabel = (vistaActiva) => {
    if (vistaActiva === HOY_VISTAS.ACTIVAS) return 'activas';
    if (vistaActiva === HOY_VISTAS.MES) return 'del mes';
    if (vistaActiva === HOY_VISTAS.HOY) return 'para hoy';
    if (vistaActiva === HOY_VISTAS.MANANA) return 'para mañana';
    if (vistaActiva === HOY_VISTAS.SEMANA) return 'para esta semana';
    return 'activas';
};

export const getHoyEmptyCopy = (vistaActiva, subject = 'tareas') => {
    if (vistaActiva === HOY_VISTAS.ACTIVAS) return `Sin ${subject} activas`;
    if (vistaActiva === HOY_VISTAS.MES) return `Sin ${subject} del mes`;
    if (vistaActiva === HOY_VISTAS.HOY) return `Sin ${subject} para hoy`;
    if (vistaActiva === HOY_VISTAS.MANANA) return `Sin ${subject} para mañana`;
    if (vistaActiva === HOY_VISTAS.SEMANA) return `Sin ${subject} para esta semana`;
    return `Sin ${subject} activas`;
};

export const getHoyEmptyIcon = (vistaActiva) => {
    if (vistaActiva === HOY_VISTAS.SEMANA) return 'date_range';
    if (vistaActiva === HOY_VISTAS.MANANA) return 'event';
    if (vistaActiva === HOY_VISTAS.HOY) return 'today';
    return 'task_alt';
};

export const getMetricTotalForVista = (metricas = {}, vistaActiva, scope = 'general') => {
    const vista = vistaActiva || getDefaultHoyVista(scope);
    if (vista === HOY_VISTAS.MES) return metricas.totalMes ?? metricas.totalResumen ?? 0;
    if (vista === HOY_VISTAS.ACTIVAS) return metricas.totalActivas ?? metricas.totalResumen ?? 0;
    if (vista === HOY_VISTAS.HOY) return metricas.totalHoy ?? 0;
    if (vista === HOY_VISTAS.MANANA) return metricas.totalManana ?? 0;
    if (vista === HOY_VISTAS.SEMANA) return metricas.totalSemana ?? 0;
    return metricas.totalResumen ?? 0;
};
