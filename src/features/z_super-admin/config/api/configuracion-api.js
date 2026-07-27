import api from '@/lib/axios';

/**
 * Obtener estado del feature flag de mantenimientos autónomos
 */
export const getAutonomosConfig = () =>
  api.get('/api/configuracion/autonomos').then((res) => res.data);

/**
 * Actualizar estado del feature flag de mantenimientos autónomos
 */
export const patchAutonomosConfig = (habilitado) =>
  api.patch('/api/configuracion/autonomos', { habilitado }).then((res) => res.data);
