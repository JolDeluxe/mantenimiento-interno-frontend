// src/features/calendario/api/calendario-api.js
import api from '@/lib/axios';

/**
 * Obtiene los tickets/mantenimientos filtrados desde el endpoint unificado.
 */
export const getCalendarioTickets = (params = {}) =>
    api.get('/api/tickets', { params });

/**
 * Obtiene las métricas/contadores de tickets filtrados del periodo.
 */
export const getCalendarioMetrics = (params = {}) =>
    api.get('/api/tickets/metrics', { params });

/**
 * Devuelve el listado de técnicos asignables con sus cargas de trabajo.
 */
export const getAsignables = async () => {
    const res = await api.get('/api/usuarios/workload');
    return Array.isArray(res?.data) ? res.data : [];
};
