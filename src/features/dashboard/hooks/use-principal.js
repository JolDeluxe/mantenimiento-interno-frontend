import { useState, useCallback } from 'react';
import { getDashboardPrincipal } from '../api/metricas-api';

export const usePrincipal = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPrincipal = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getDashboardPrincipal();
            setData(res?.data ?? null);
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al cargar el dashboard.');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchPrincipal };
};