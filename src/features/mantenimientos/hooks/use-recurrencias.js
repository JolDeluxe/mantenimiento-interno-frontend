import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createReglaRecurrencia,
    deleteReglaRecurrencia,
    getRecurrencias,
    materializeReglaCiclo,
    updateReglaRecurrencia,
} from '../api/recurrencias-api';

const normalizeListResponse = (res) => {
    const root = res?.data && !Array.isArray(res.data) ? res.data : res;
    const data = Array.isArray(root?.data) ? root.data : Array.isArray(root) ? root : [];
    return {
        data,
        total: root?.total ?? data.length,
        page: root?.page ?? 1,
        limit: root?.limit ?? 20,
    };
};

export const useRecurrencias = (initialFilters = {}) => {
    const [reglas, setReglas] = useState([]);
    const [filters, setFilters] = useState({ page: 1, limit: 20, activo: true, ...initialFilters });
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const lastFilters = useRef(filters);

    const fetchReglas = useCallback(async (nextFilters = lastFilters.current) => {
        const cleanFilters = Object.fromEntries(
            Object.entries(nextFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        );

        setLoading(true);
        setError(null);
        lastFilters.current = cleanFilters;

        try {
            const res = await getRecurrencias(cleanFilters);
            const parsed = normalizeListResponse(res);
            setReglas(parsed.data);
            setPagination({ total: parsed.total, page: parsed.page, limit: parsed.limit });
            return parsed;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al cargar reglas recurrentes.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReglas(filters).catch(() => {});
    }, [fetchReglas, filters]);

    const updateFilters = useCallback((patch) => {
        setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
    }, []);

    const createRegla = useCallback(async (payload) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await createReglaRecurrencia(payload);
            await fetchReglas();
            return res;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al crear regla recurrente.';
            setError(message);
            throw new Error(message);
        } finally {
            setSubmitting(false);
        }
    }, [fetchReglas]);

    const updateRegla = useCallback(async (id, payload) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await updateReglaRecurrencia(id, payload);
            await fetchReglas();
            return res;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar regla recurrente.';
            setError(message);
            throw new Error(message);
        } finally {
            setSubmitting(false);
        }
    }, [fetchReglas]);

    const toggleActivo = useCallback(async (regla) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = regla.activo
                ? await deleteReglaRecurrencia(regla.id)
                : await updateReglaRecurrencia(regla.id, { activo: true });
            await fetchReglas();
            return res;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado de regla.';
            setError(message);
            throw new Error(message);
        } finally {
            setSubmitting(false);
        }
    }, [fetchReglas]);

    const materializeRegla = useCallback(async (regla) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await materializeReglaCiclo(regla.id);
            await fetchReglas();
            return res;
        } catch (err) {
            const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al materializar ciclo.';
            setError(message);
            throw new Error(message);
        } finally {
            setSubmitting(false);
        }
    }, [fetchReglas]);

    return {
        reglas,
        filters,
        pagination,
        loading,
        submitting,
        error,
        fetchReglas,
        createRegla,
        updateRegla,
        toggleActivo,
        materializeRegla,
        refresh: () => fetchReglas(),
        setFilters: updateFilters,
    };
};
