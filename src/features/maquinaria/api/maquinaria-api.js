import api from '@/lib/axios';

/**
 * Obtener listado paginado y filtrado de maquinaria
 */
export const getMaquinas = (params = {}) =>
  api.get('/api/maquinas', { params });

/**
 * Obtener detalles de pre-llenado de una máquina a partir de su código QR
 */
export const getMaquinaPrefill = (codigo) =>
  api.get(`/api/maquinas/codigo/${codigo}/prefill`);

/**
 * Obtener la ficha detallada de una máquina por ID
 */
export const getMaquinaById = (id) =>
  api.get(`/api/maquinas/${id}`);

/**
 * Obtener los KPIs e historial de la máquina (MTTR, MTBF, Fallas)
 */
export const getMaquinaKpis = (id, params = {}) =>
  api.get(`/api/maquinas/${id}/kpis`, { params });

/**
 * Crear una nueva máquina en el catálogo
 */
export const createMaquina = (data) =>
  api.post('/api/maquinas', data);

/**
 * Actualizar datos de una máquina existente
 */
export const updateMaquina = (id, data) =>
  api.put(`/api/maquinas/${id}`, data);

/**
 * Cambiar el estado operativo de una máquina (OPERATIVA, EN_REPARACION, etc.)
 */
export const patchMaquinaEstado = (id, data) =>
  api.patch(`/api/maquinas/${id}/estado`, data);