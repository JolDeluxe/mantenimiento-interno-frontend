import api from '@/lib/axios';

/**
 * Obtener listado paginado y filtrado de maquinaria
 */
export const getMaquinas = (params = {}) =>
  api.get('/api/maquinas', { params });

const extractMaquinasPage = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const extractPagination = (response) => response?.data?.pagination || response?.pagination || {};

export const getAllMaquinas = async (params = {}) => {
  const limit = 1000;
  const allMaquinas = [];
  let page = 1;
  let totalPages = null;

  while (totalPages === null || page <= totalPages) {
    const response = await getMaquinas({ ...params, page, limit });
    const pageData = extractMaquinasPage(response);
    const pagination = extractPagination(response);
    const parsedTotalPages = Number(pagination.totalPages || pagination.pages);

    allMaquinas.push(...pageData);

    if (Number.isFinite(parsedTotalPages) && parsedTotalPages > 0) {
      totalPages = parsedTotalPages;
    } else if (pageData.length < limit) {
      break;
    }

    page += 1;
  }

  return allMaquinas;
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
