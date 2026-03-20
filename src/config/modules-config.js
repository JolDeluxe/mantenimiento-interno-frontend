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
    id: 'reportes',
    name: 'Reportes',
    icon: 'bar_chart',
    route: '/reportes',
    allowedRoles: ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'],
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

/**
 * Filtra módulos según el rol del usuario
 */
export const getModulesByRole = (userRole) => {
  if (!userRole) return [];
  
  return MODULES_CONFIG.filter(module => 
    module.allowedRoles.includes(userRole)
  );
};

/**
 * Verifica si un usuario tiene acceso a un módulo específico
 */
export const canAccessModule = (userRole, moduleId) => {
  const module = MODULES_CONFIG.find(m => m.id === moduleId);
  return module ? module.allowedRoles.includes(userRole) : false;
};