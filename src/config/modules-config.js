/**
 * Configuración centralizada de módulos del sistema
 * Cada módulo define: nombre, icono, ruta y roles permitidos
 */

export const MODULES_CONFIG = [
  {
    id: 'hoy',
    name: 'Activas',
    icon: 'today',
    route: '/hoy',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
    children: [
      {
        id: 'hoy-todas',
        name: 'Todas las Tareas',
        route: '/hoy/todas',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'hoy-actividades',
        name: 'Actividades de Hoy',
        route: '/hoy/actividades',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'hoy-mantenimientos',
        name: 'Mantenimientos de Hoy',
        route: '/hoy/mantenimientos',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
    ]
  },
  {
    id: 'tickets',
    name: 'Gestión de Actividades',
    icon: 'assignment',
    route: '/tickets',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
    children: [
      {
        id: 'tickets-actividades',
        name: 'Actividades',
        route: '/tickets/actividades',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'tickets-reportes',
        name: 'Reportes',
        route: '/tickets/reportes',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'tickets-historico',
        name: 'Histórico',
        route: '/tickets/historico',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
    ]
  },
  {
    id: 'mantenimientos',
    name: 'Gestión de Mantenimientos',
    icon: 'build_circle',
    route: '/mantenimientos',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
    children: [
      {
        id: 'mantenimientos-correctivos',
        name: 'Correctivos',
        route: '/mantenimientos/correctivos',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'mantenimientos-preventivos',
        name: 'Preventivos',
        route: '/mantenimientos/preventivos',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      },
      {
        id: 'mantenimientos-historico',
        name: 'Histórico',
        route: '/mantenimientos/historico',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
      }
    ]
  },
  {
    id: 'bandeja',
    name: 'Bandeja de Entrada',
    icon: 'inbox',
    route: '/bandeja',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
  },
  {
    id: 'calendario',
    name: 'Calendario',
    icon: 'calendar_month',
    route: '/calendario',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
  },
  {
    id: 'aprobar',
    name: 'Por Aprobar',
    icon: 'check',
    route: '/aprobar',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
    allowedRoles: ['SUPER_ADMIN', 'TECNICO'],
    divider: true,
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
