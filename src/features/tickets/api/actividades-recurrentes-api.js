import api from '@/lib/axios';

const base = '/api/actividades-recurrentes';
export const getActividadesRecurrentes = (params = {}) => api.get(base, { params });
export const getActividadRecurrente = (id) => api.get(`${base}/${id}`);
export const getProyeccionesActividades = (params = {}) => api.get(`${base}/proyecciones`, { params });
export const getProyeccionesActividad = (id, params = {}) => api.get(`${base}/${id}/proyecciones`, { params });
export const getAjustesActividad = (id) => api.get(`${base}/${id}/ajustes`);
export const createActividadRecurrente = (data) => api.post(base, data);
export const updateActividadRecurrente = (id, data) => api.put(`${base}/${id}`, data);
export const setActividadActiva = (id, activo) => api.patch(`${base}/${id}/activo`, { activo });
export const archivarActividad = (id) => api.patch(`${base}/${id}/archivar`);
export const restaurarActividad = (id) => api.patch(`${base}/${id}/restaurar`);
export const deleteActividad = (id) => api.delete(`${base}/${id}`, { data: { confirmar: true } });
export const materializarActividad = (id, data) => api.post(`${base}/${id}/materialize`, data);
export const moverOcurrenciaActividad = (id, data) => api.post(`${base}/${id}/ocurrencias/mover`, data);
export const omitirOcurrenciaActividad = (id, data) => api.post(`${base}/${id}/ocurrencias/omitir`, data);
export const quitarAjusteActividad = (id, data) => api.delete(`${base}/${id}/ocurrencias/ajuste`, { data });
