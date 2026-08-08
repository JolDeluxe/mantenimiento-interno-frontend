import api from '@/lib/axios';

export const getBIMaquinariaKPIs = (params = {}, config = {}) =>
  api.get('/api/bi/maquinaria/kpis', { ...config, params });

export const getBIMaquinariaDetalle = (maquinaId, params = {}, config = {}) =>
  api.get(`/api/bi/maquinaria/${maquinaId}/detalle`, { ...config, params });

export const getBIMaquinariaFiltros = (config = {}) =>
  api.get('/api/bi/maquinaria/filtros', config);

export const generarBIMaquinariaReporte = (data, config = {}) =>
  api.post('/api/bi/maquinaria/reportes/generar', data, { ...config, responseType: 'blob' });

export const enviarBIMaquinariaReporte = (data, config = {}) =>
  api.post('/api/bi/maquinaria/reportes/enviar', data, config);
