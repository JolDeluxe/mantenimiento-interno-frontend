import { useState, useCallback } from 'react';
import { getDashboardKpis } from '../api/metricas-api';

export const useMetricas = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetricas = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getDashboardKpis(params);

      // Dado que el interceptor de Axios ya desempaqueta el objeto HTTP,
      // 'res' equivale directamente al JSON enviado por Express: 
      // { status: 'success', data: { metricasPorPlanta: [...] } }
      // Por ende, accedemos solo a res.data
      setData(res?.data || null);

    } catch (err) {
      setError(err?.response?.data?.error || 'Error de conexión o endpoint no encontrado.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchMetricas };
};