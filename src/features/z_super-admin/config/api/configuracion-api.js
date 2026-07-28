import api from '@/lib/axios';

/**
 * Obtener estado del feature flag de mantenimientos autónomos.
 * @param {AbortSignal} [signal] - Señal de cancelación opcional.
 */
export const getAutonomosConfig = (signal) =>
  api.get('/api/configuracion/autonomos', { signal }).then((res) => res.data);

/**
 * Actualizar estado del feature flag de mantenimientos autónomos.
 * @param {boolean} habilitado
 */
export const patchAutonomosConfig = (habilitado) =>
  api.patch('/api/configuracion/autonomos', { habilitado }).then((res) => res.data);
