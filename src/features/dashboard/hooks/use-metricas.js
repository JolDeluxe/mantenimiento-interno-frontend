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
      setData(res?.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al cargar métricas.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchMetricas };
};