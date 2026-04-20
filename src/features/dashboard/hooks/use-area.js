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

      // // TRAZADOR FRONTEND 1: Respuesta cruda de la API
      // console.log('--- [DEBUG FRONTEND: AXIOS] ---');
      // console.log('Objeto completo recibido:', res);
      // console.log('Metricas por planta extraídas:', res?.data?.metricasPorPlanta);
      // console.log('-------------------------------');

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
