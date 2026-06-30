// src/features/tickets/constants.js

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
    { value: 'CRITICA', label: 'Crítica' },
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
    { value: 'MAQUINARIA', label: 'Maquinaria', icon: 'precision_manufacturing'},
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura', icon: 'domain',},
    { value: 'EQUIPO/MATERIAL', label: 'Equipo/Material', icon: 'construction'},
    { value: 'MOBILIARIO', label: 'Mobiliario', icon: 'chair' },
    { value: 'GESTION', label: 'Gestion Administrativa', icon: 'admin_panel_settings'},
    { value: 'RUTINA', label: 'Rutina', icon: 'sync' },
];

// Nuevo mapa jerárquico de Plantas a Áreas
export const AREAS_POR_PLANTA = {
    OMEGA: [
        'PT',
    ],
    SIGMA: [
        'PRELIMINARES',
        'LASER Y BORDADO',
    ],
    LAMBDA: [
        'BOLSAS Y BILLETERAS'
    ],
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
    GENERAL: []
};

// Generación plana y deduplicada para selects globales que no filtran por planta
export const AREAS = [...new Set(Object.values(AREAS_POR_PLANTA).flat())];