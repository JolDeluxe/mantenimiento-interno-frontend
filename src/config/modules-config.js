/**
 * Configuración centralizada de módulos del sistema
 * Cada módulo define: nombre, icono, ruta y roles permitidos
 */

export const MODULES_CONFIG = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
    route: '/',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO', 'CLIENTE_INTERNO'],
  },
  {
    id: 'tickets',
    name: 'Gestión de Actividades',
    icon: 'assignment',
    route: '/tickets',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO', 'CLIENTE_INTERNO'],
    children: [
      {
        id: 'tickets-hoy',
        name: 'Tareas de Hoy',
        route: '/tickets/hoy',
        allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO', 'TECNICO'],
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
  return MODULES_CONFIG.filter(module => module.allowedRoles.includes(userRole));
};

export const canAccessModule = (userRole, moduleId) => {
  const module = MODULES_CONFIG.find(m => m.id === moduleId);
  return module ? module.allowedRoles.includes(userRole) : false;
};