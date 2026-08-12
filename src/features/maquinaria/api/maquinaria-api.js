import api from '@/lib/axios';

/**
 * Obtener listado paginado y filtrado de maquinaria
 */
export const getMaquinas = (params = {}) =>
  api.get('/api/maquinas', { params });

export const getAllMaquinas = async (params = {}) => {
  const limit = 1000;
  const firstResponse = await getMaquinas({ ...params, page: 1, limit });
  const firstPayload = firstResponse?.data || {};
  const firstData = Array.isArray(firstPayload.data) ? firstPayload.data : [];
  const totalPages = Number(firstPayload.pagination?.totalPages || 1);

  if (totalPages <= 1) return firstData;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getMaquinas({ ...params, page: index + 2, limit })
    )
  );

  return rest.reduce((acc, response) => {
    const pageData = response?.data?.data;
    if (Array.isArray(pageData)) acc.push(...pageData);
    return acc;
  }, [...firstData]);
};

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
 * Actualizar datos de una máquina existente
 */
export const updateMaquina = (id, data) =>
  api.put(`/api/maquinas/${id}`, data);

/**
 * Cambiar el estado operativo de una máquina (OPERATIVA, EN_REPARACION, etc.)
 */
export const patchMaquinaEstado = (id, data) =>
  api.patch(`/api/maquinas/${id}/estado`, data);
