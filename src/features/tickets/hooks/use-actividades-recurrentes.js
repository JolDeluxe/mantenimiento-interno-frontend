import { useCallback, useRef, useState } from 'react';
import * as api from '../api/actividades-recurrentes-api';

const message = (error) => {
    const data = error?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.map((item) => item?.message).filter(Boolean).join('. ');
    }
    return data?.error || data?.message || error?.message || 'No se pudo completar la operación.';
};

const unwrapResponse = (response) => (
    response?.config && response?.status ? response.data : response
);

export const useActividadesRecurrentes = () => {
    const [reglas, setReglas] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const last = useRef({ page: 1, limit: 20 });

    const fetchReglas = useCallback(async (params = last.current) => {
        setLoading(true);
        setError('');
        last.current = params;
        try {
            const res = await api.getActividadesRecurrentes(params);
            const root = unwrapResponse(res) || {};
            setReglas(root.data || []);
            setPagination(root.pagination || {});
            return root;
        } catch (err) {
            setError(message(err));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const mutate = useCallback(async (operation) => {
        setSubmitting(true);
        setError('');
        try {
            const res = await operation();
            await fetchReglas(last.current);
            return unwrapResponse(res);
        } catch (err) {
            const text = message(err);
            setError(text);
            throw new Error(text);
        } finally {
            setSubmitting(false);
        }
    }, [fetchReglas]);

    return {
        reglas,
        pagination,
        loading,
        submitting,
        error,
        refresh: () => fetchReglas(last.current),
        fetchReglas,
        create: (data) => mutate(() => api.createActividadRecurrente(data)),
        update: (id, data) => mutate(() => api.updateActividadRecurrente(id, data)),
        setActivo: (id, activo) => mutate(() => api.setActividadActiva(id, activo)),
        cancelar: (id) => mutate(() => api.archivarActividad(id)),
        restaurar: (id) => mutate(() => api.restaurarActividad(id)),
        remove: (id) => mutate(() => api.deleteActividad(id)),
        materializar: (id, data) => mutate(() => api.materializarActividad(id, data)),
        mover: (id, data) => mutate(() => api.moverOcurrenciaActividad(id, data)),
        omitir: (id, data) => mutate(() => api.omitirOcurrenciaActividad(id, data)),
        quitarAjuste: (id, data) => mutate(() => api.quitarAjusteActividad(id, data)),
        detalle: api.getActividadRecurrente,
        proyecciones: api.getProyeccionesActividad,
        ajustes: api.getAjustesActividad,
    };
};
