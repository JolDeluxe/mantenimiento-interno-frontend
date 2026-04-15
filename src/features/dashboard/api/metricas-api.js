import api from '@/lib/axios';

export const getDashboardKpis = (params = {}) =>
  api.get('/api/dashboard/kpis', { params });

export const getTecnicoDetalle = (id, params = {}) =>
  api.get(`/api/dashboard/tecnico/${id}/kpis`, { params });