export const PLANTAS = ['KAPPA', 'OMEGA', 'SIGMA', 'LAMBDA'];

export const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

export const TIPOS = [
    { value: 'TICKET', label: 'Reporte' },
    { value: 'PLANEADA', label: 'Planeada' },
    { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

export const TIPOS_ADMIN = [
    { value: 'PLANEADA', label: 'Planeada' },
    { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

export const PRIORIDADES = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Critica' },
];

export const CLASIFICACIONES = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'RUTINA', label: 'Rutina' },
];

export const CLASIFICACIONES_CLIENTE = [
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
];

export const CLASIFICACIONES_ADMIN = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'RUTINA', label: 'Rutina' },
];

export const CATEGORIAS_EQUIPO = [
    { value: 'MAQUINARIA', label: 'Maquinaria', icon: 'precision_manufacturing' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura', icon: 'domain' },
    { value: 'EQUIPO/MATERIAL', label: 'Equipo/Material', icon: 'construction' },
    { value: 'MOBILIARIO', label: 'Mobiliario', icon: 'chair' },
    { value: 'GESTION', label: 'Gestion Administrativa', icon: 'admin_panel_settings' },
    { value: 'RUTINA', label: 'Rutina', icon: 'sync' },
];

export const AREAS_POR_PLANTA = {
    OMEGA: ['PT'],
    SIGMA: ['PRELIMINARES', 'LASER Y BORDADO'],
    LAMBDA: ['BOLSAS Y BILLETERAS'],
    KAPPA: [
        'ACABADO',
        'ALMACEN DE MATERIA PRIMA',
        'ALMACEN DE PIELES',
        'BORDADO',
        'CELULA DESARROLLO',
        'CHAMARRAS',
        'CINTOS',
        'CORTE',
        'LASER',
        'PESPUNTE',
        'MONTADO',
        'PRELIMINARES',
    ],
    GENERAL: [],
};

export const AREAS = [...new Set(Object.values(AREAS_POR_PLANTA).flat())];

export const CLASIFICACION_ICONS = {
    PREVENTIVO: 'build_circle',
    CORRECTIVO: 'report_problem',
    INSPECCION: 'search',
    RUTINA: 'sync',
};

export const TIPO_STYLES = {
    TICKET: 'bg-slate-100 text-slate-600 border-slate-200/60',
    PLANEADA: 'bg-blue-50 text-blue-700 border-blue-200/60',
    EXTRAORDINARIA: 'bg-purple-50 text-purple-700 border-purple-200/60',
};

export const getClasificacionIcon = (clasificacion) => {
    return CLASIFICACION_ICONS[clasificacion] || 'label';
};

export const getTipoStyle = (tipo) => {
    return TIPO_STYLES[tipo] || 'bg-slate-100 text-slate-500 border-slate-200';
};

export const getCategoriaInfo = (categoria) => {
    return CATEGORIAS_EQUIPO.find(c => c.value === categoria) || {
        label: categoria,
        icon: 'category',
        colorClass: 'bg-slate-100 text-slate-500 border-slate-200',
    };
};
