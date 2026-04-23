import { useState, useEffect, useCallback } from 'react';
import { getDashboardGeneral } from '../api/metricas-api';

export function useGeneral(filtros = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 💡 1. Encapsulamos la petición en un useCallback para poder exportarla y llamarla al hacer clic
    const fetchGeneral = useCallback(async (filtrosOverride) => {
        setLoading(true);
        setError(null);
        try {
            const activeFiltros = filtrosOverride || filtros;
            const params = {};

            if (activeFiltros.year) params.year = activeFiltros.year;
            if (activeFiltros.month) params.month = activeFiltros.month;
            if (activeFiltros.fechaInicio) params.fechaInicio = activeFiltros.fechaInicio;
            if (activeFiltros.fechaFin) params.fechaFin = activeFiltros.fechaFin;
            if (activeFiltros.departamentoId) params.departamentoId = activeFiltros.departamentoId;

            const response = await getDashboardGeneral(params);
            setData(response.data);
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Error al cargar KPIs generales';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filtros)]);

    // 💡 2. Se ejecuta automáticamente al cargar o cambiar filtros
    useEffect(() => {
        fetchGeneral();
    }, [fetchGeneral]);

    return { data, loading, error, fetchGeneral };
}