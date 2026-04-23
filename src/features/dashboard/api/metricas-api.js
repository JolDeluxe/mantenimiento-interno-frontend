import api from '@/lib/axios';

export const getDashboardGeneral = (params = {}) =>
  api.get('/api/dashboard/kpis/general', { params });

export const getDashboardKpis = (params = {}) =>
  api.get('/api/dashboard/kpis/area', { params });

export const getEquipoKpis = (params = {}) =>
  api.get('/api/dashboard/kpis/equipo', { params });

export const getTecnicoDetalle = (id, params = {}) =>
  api.get(`/api/dashboard/tecnico/${id}/kpis`, { params });

// Dashboard principal — sin parámetros, el backend resuelve el mes en curso
export const getDashboardPrincipal = () =>
  api.get('/api/dashboard/kpis/principal');