// src/features/maquinaria/hooks/use-maquina-recurrencias.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
    getMaquinaRecurrencias,
    createReglaRecurrencia,
    updateReglaRecurrencia,
    deleteReglaRecurrencia,
    materializeReglaCiclo
} from '../api/recurrencias-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';

export const useMaquinaRecurrencias = (maquinaId) => {
    const [recurrencias, setRecurrencias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const hasHydratedFromCache = useRef(false);

    const fetchRecurrencias = useCallback(async () => {
        if (!maquinaId) return;
        setLoading(true);
        setError(null);

        const cacheKey = `recurrencias_maquina_${maquinaId}`;

        // 1. Hidratación rápida desde cache IndexedDB
        if (!hasHydratedFromCache.current) {
            try {
                const snapshot = await readSnapshot('recurrencias', cacheKey);
                if (snapshot?.data) {
                    setRecurrencias(snapshot.data);
                    hasHydratedFromCache.current = true;
                }
            } catch (err) {
                console.warn('[useMaquinaRecurrencias] Cache read failed:', err);
            }
        }

        // 2. Si no hay conexión de red, finalizar
        if (!navigator.onLine) {
            setLoading(false);
            return;
        }

        // 3. Consulta de red fresca
        try {
            const res = await getMaquinaRecurrencias(maquinaId);
            const data = res?.data?.data || res?.data || [];
            setRecurrencias(data);

            // Guardar instantánea actualizada
            await writeSnapshot('recurrencias', data, cacheKey);
        } catch (err) {
            console.error('[useMaquinaRecurrencias] Fetch error:', err);
            setError(err?.response?.data?.error || 'Error al obtener las reglas de recurrencia.');
        } finally {
            setLoading(false);
        }
    }, [maquinaId]);

    // Consultar automáticamente al montar o cambiar maquinaId
    useEffect(() => {
        hasHydratedFromCache.current = false;
        fetchRecurrencias();
    }, [maquinaId, fetchRecurrencias]);

    const handleCreate = useCallback(async (data) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await createReglaRecurrencia(data);
            await fetchRecurrencias();
            return res?.data;
        } catch (err) {
            const errMsg = err?.response?.data?.error || 'Error al crear la regla de recurrencia.';
            setError(errMsg);
            throw new Error(errMsg);
        } finally {
            setSubmitting(false);
        }
    }, [fetchRecurrencias]);

    const handleUpdate = useCallback(async (id, data) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await updateReglaRecurrencia(id, data);
            await fetchRecurrencias();
            return res?.data;
        } catch (err) {
            const errMsg = err?.response?.data?.error || 'Error al actualizar la regla de recurrencia.';
            setError(errMsg);
            throw new Error(errMsg);
        } finally {
            setSubmitting(false);
        }
    }, [fetchRecurrencias]);

    const handleDelete = useCallback(async (id) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await deleteReglaRecurrencia(id);
            await fetchRecurrencias();
            return res?.data;
        } catch (err) {
            const errMsg = err?.response?.data?.error || 'Error al desactivar la regla de recurrencia.';
            setError(errMsg);
            throw new Error(errMsg);
        } finally {
            setSubmitting(false);
        }
    }, [fetchRecurrencias]);

    const handleMaterialize = useCallback(async (id, fechaCicloLogicaStr) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await materializeReglaCiclo(id, {
                fechaCicloLogica: fechaCicloLogicaStr
            });
            await fetchRecurrencias();
            return res?.data;
        } catch (err) {
            const errMsg = err?.response?.data?.error || 'Error al materializar el preventivo.';
            setError(errMsg);
            throw new Error(errMsg);
        } finally {
            setSubmitting(false);
        }
    }, [fetchRecurrencias]);

    return {
        recurrencias,
        loading,
        submitting,
        error,
        fetchRecurrencias,
        createRecurrencia: handleCreate,
        updateRecurrencia: handleUpdate,
        deleteRecurrencia: handleDelete,
        materializeRecurrencia: handleMaterialize
    };
};
