// src/features/tickets/constants.js

export const PLANTAS = ['KAPPA', 'OMEGA', 'SIGMA', 'LAMBDA'];

export const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

export const TIPOS = [
    { value: 'TICKET', label: 'Ticket' },
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
    { value: 'INSPECCION', label: 'Inspección' },
];

export const CLASIFICACIONES_CLIENTE = [
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
];

export const CLASIFICACIONES_ADMIN = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'INSPECCION', label: 'Inspección' },
];

export const CATEGORIAS_EQUIPO = [
    { value: 'MAQUINARIA', label: 'Maquinaria de Producción' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura e Instalaciones' },
    { value: 'EQUIPO/MATERIAL', label: 'Equipos de Apoyo' },
    { value: 'MOBILIARIO', label: 'Mobiliario' },
    { value: 'RUTINA', label: 'Rutina' },
    { value: 'GESTION', label: 'Gestión Operativa' },
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