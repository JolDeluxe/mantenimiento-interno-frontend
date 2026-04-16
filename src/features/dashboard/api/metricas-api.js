// src/features/dashboard/api/metricas-api.js
import api from '@/lib/axios';

export const getDashboardKpis = (params = {}) =>
  api.get('/api/dashboard/kpis/area', { params }); // Se agregó /area al endpoint

export const getTecnicoDetalle = (id, params = {}) =>
  api.get(`/api/dashboard/tecnico/${id}/kpis`, { params });