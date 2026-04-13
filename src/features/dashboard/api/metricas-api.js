import api from '@/lib/axios';

export const getDashboardKpis = (params = {}) =>
  api.get('/api/dashboard/kpis', { params });