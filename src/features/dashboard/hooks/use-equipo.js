import { useState, useCallback } from 'react';
import { getEquipoKpis } from '../api/metricas-api';

export const useEquipo = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEquipo = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getEquipoKpis(params);
            setData(res?.data ?? null);
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al cargar datos del equipo.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchEquipo };
};