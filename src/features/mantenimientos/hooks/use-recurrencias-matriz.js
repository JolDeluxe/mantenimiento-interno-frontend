import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRecurrenciasMatriz, materializeReglaCiclo } from '../api/recurrencias-api';

const ESTADOS_BAJA = new Set(['BAJA', 'BAJA_ERP', 'DESUSO', 'INACTIVA']);

const normalizeMatrizResponse = (res) => {
    const root = res?.data && !Array.isArray(res.data) ? res.data : res;
    const rows = Array.isArray(root?.rows) ? root.rows : [];
    return {
        year: root?.year,
        total: root?.total ?? rows.length,
        rows,
    };
};

export const useRecurrenciasMatriz = (initialYear = new Date().getFullYear()) => {
    const [year, setYear] = useState(initialYear);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        q: '',
        responsable: '',
        estadoRegla: '',
        mostrarBajaDesuso: false,
    });

    const fetchMatriz = useCallback(async (targetYear = year) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getRecurrenciasMatriz({ year: targetYear });
            const parsed = normalizeMatrizResponse(res);
            setRows(parsed.rows);
            setTotal(parsed.total);
            if (parsed.year && parsed.year !== targetYear) setYear(parsed.year);
            return parsed;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al cargar matriz recurrente.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchMatriz(year).catch(() => {});
    }, [fetchMatriz, year]);

    const filteredRows = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return rows.filter((row) => {
            const maquinaEstado = String(row.maquina?.estado || '').toUpperCase();
            if (!filters.mostrarBajaDesuso && ESTADOS_BAJA.has(maquinaEstado)) return false;

            if (filters.estadoRegla === 'activa' && !row.regla?.activo) return false;
            if (filters.estadoRegla === 'pausada' && row.regla?.activo) return false;

            if (filters.responsable && String(row.regla?.tecnicoResponsable?.id || '') !== String(filters.responsable)) {
                return false;
            }

            if (!q) return true;
            const haystack = [
                row.maquina?.codigo,
                row.maquina?.nombre,
                row.maquina?.area,
                row.maquina?.planta,
                row.regla?.titulo,
                row.regla?.tecnicoResponsable?.nombre,
                row.regla?.frecuencia,
            ].filter(Boolean).join(' ').toLowerCase();

            return haystack.includes(q);
        });
    }, [filters, rows]);

    const responsables = useMemo(() => {
        const map = new Map();
        rows.forEach((row) => {
            const tecnico = row.regla?.tecnicoResponsable;
            if (tecnico?.id) map.set(String(tecnico.id), tecnico.nombre || `Tecnico ${tecnico.id}`);
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [rows]);

    const materializeFromCell = useCallback(async (row) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await materializeReglaCiclo(row.regla.id);
            await fetchMatriz(year);
            return res;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al generar ciclo.';
            setError(message);
            throw new Error(message);
        } finally {
            setSubmitting(false);
        }
    }, [fetchMatriz, year]);

    const updateFilter = useCallback((patch) => {
        setFilters((prev) => ({ ...prev, ...patch }));
    }, []);

    return {
        year,
        setYear,
        rows,
        filteredRows,
        total,
        loading,
        submitting,
        error,
        filters,
        responsables,
        setFilters: updateFilter,
        refresh: () => fetchMatriz(year),
        materializeFromCell,
    };
};
