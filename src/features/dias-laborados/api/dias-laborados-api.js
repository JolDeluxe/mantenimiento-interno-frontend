import api from '@/lib/axios';

export const getDiasLaborados = (params, config = {}) =>
  api.get('/api/dias-laborados', { ...config, params });

