/**
 * Configuración centralizada de módulos del sistema
 * Cada módulo define: nombre, icono, ruta y roles permitidos
 */

export const MODULES_CONFIG = [
  {
    id: 'tickets',
    name: 'Gestión de Actividades',
    icon: 'assignment',
    route: '/tickets',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
    children: [
      {
        id: 'tickets-hoy',
        name: 'Tareas de Hoy',
        route: '/tickets/hoy',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'tickets-aprobar',
        name: 'Por Aprobar',
        route: '/tickets/aprobar',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      },
      {
        id: 'tickets-bandeja',
        name: 'Bandeja de Entrada',
        route: '/tickets/bandeja',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      },
      {
        id: 'tickets-historico',
        name: 'Histórico',
        route: '/tickets/historico',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO', 'CLIENTE_INTERNO'],
      }
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    allowedRoles: ['SUPER_ADMIN', 'TECNICO'],
  },
  {
    id: 'reportes',
    name: 'Reportes y KPIs',
    icon: 'bar_chart',
    route: '/reportes',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
    children: [
      {
        id: 'reportes-general',
        name: 'General',
        route: '/reportes/general',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      },
      {
        id: 'reportes-equipo',
        name: 'Equipo',
        route: '/reportes/equipo',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      },
      {
        id: 'reportes-area',
        name: 'Área',
        route: '/reportes/area',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      },
      {
        id: 'reportes-cliente',
        name: 'Cliente',
        route: '/reportes/cliente',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
      }
    ]
  },
  {
    id: 'maquinaria',
    name: 'Maquinaria',
    icon: 'precision_manufacturing',
    route: '/maquinaria',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
  },
  {
    id: 'usuarios',
    name: 'Usuarios',
    icon: 'group',
    route: '/usuarios',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO'],
  },
  {
    id: 'dias_laborados',
    name: 'Días Laborados',
    icon: 'calendar_clock',
    route: '/dias_laborados',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
    hideInMenu: true,
  },
  {
    id: 'departamentos',
    name: 'Departamentos',
    icon: 'corporate_fare',
    route: '/departamentos',
    allowedRoles: ['SUPER_ADMIN'],
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: 'notifications',
    route: '/notificaciones',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO', 'CLIENTE_INTERNO'],
    hideInMenu: true,
  },
  {
    id: 'configuracion',
    name: 'Configuración',
    icon: 'settings',
    route: '/configuracion',
    allowedRoles: ['SUPER_ADMIN'],

  },
];

export const getModulesByRole = (userRole) => {
  if (!userRole) return [];

  return MODULES_CONFIG
    // 1. Filtramos por rol Y que no esté marcado como oculto
    .filter(module => module.allowedRoles.includes(userRole) && !module.hideInMenu)
    .map(module => {
      if (module.children) {
        return {
          ...module,
          children: module.children.filter(child =>
            child.allowedRoles.includes(userRole) && !child.hideInMenu
          )
        };
      }
      return module;
    });
};

export const canAccessModule = (userRole, moduleId) => {
  const module = MODULES_CONFIG.find(m => m.id === moduleId);
  return module ? module.allowedRoles.includes(userRole) : false;
};