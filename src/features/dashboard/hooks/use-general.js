import { useState, useEffect } from 'react';
import { getDashboardGeneral } from '../api/metricas-api';

export function useGeneral(filtros = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKpis = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {};
                if (filtros.year) params.year = filtros.year;
                if (filtros.month) params.month = filtros.month;
                if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
                if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
                if (filtros.departamentoId) params.departamentoId = filtros.departamentoId;

                const response = await getDashboardGeneral(params);

                // CORRECCIÓN: 'response' ya es el JSON. Entramos solo a .data
                setData(response.data);
            } catch (err) {
                // CORRECCIÓN DE SEGURIDAD PARA EL MANEJO DE ERRORES:
                // Si Axios lanza un error, a veces el interceptor ya no expone err.response.data
                const errMsg = err.response?.data?.error || err.message || 'Error al cargar KPIs generales';
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchKpis();
    }, [JSON.stringify(filtros)]);

    return { data, loading, error };
}