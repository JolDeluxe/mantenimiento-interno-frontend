// src/features/tickets/api/tickets-api.js
// ⚠️  REGLA ARQUITECTÓNICA: Único punto de contacto HTTP del feature tickets.
//     Ninguna vista, modal o hook importa axios directamente.
import api from '@/lib/axios';

// ── Listado y detalle ──────────────────────────────────────────────────────

export const getTickets = (params = {}) =>
    api.get('/api/tickets', { params });

export const getTicketById = (id) =>
    api.get(`/api/tickets/${id}`);

// ── Métricas ───────────────────────────────────────────────────────────────

export const getTicketMetrics = (params = {}) =>
    api.get('/api/tickets/metrics', { params });

// ── Mutaciones ─────────────────────────────────────────────────────────────

export const createTicket = (data) =>
    api.post('/api/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateTicket = (id, data) =>
    api.put(`/api/tickets/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const changeTicketStatus = (id, data) =>
    api.patch(`/api/tickets/${id}/status`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ── Personal asignable ─────────────────────────────────────────────────────

/**
 * Obtiene técnicos Y coordinadores activos para asignación de tareas.
 *
 * El Zod del backend limita `limit` a max 100, por lo que hacemos dos
 * llamadas paralelas (una por rol) y fusionamos los resultados.
 * El interceptor de axios ya desenvuelve response.data, por lo que
 * cada respuesta tiene la forma { status, pagination, data: [] }.
 */
export const getAsignables = async () => {
    const PARAMS_BASE = { limit: 100, estado: 'ACTIVO' };

    const [resTecnicos, resCoords] = await Promise.all([
        api.get('/api/usuarios', { params: { ...PARAMS_BASE, rol: 'TECNICO'          } }),
        api.get('/api/usuarios', { params: { ...PARAMS_BASE, rol: 'COORDINADOR_MTTO' } }),
    ]);

    const tecnicos     = Array.isArray(resTecnicos?.data)  ? resTecnicos.data  : [];
    const coordinadores = Array.isArray(resCoords?.data)   ? resCoords.data    : [];

    // Deduplica por id (defensivo, no debería haber duplicados)
    const seen = new Set();
    return [...tecnicos, ...coordinadores].filter((u) => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
    });
};

/**
 * @deprecated Usa getAsignables() — solo fetcha TECNICO con limit 500 que
 *             viola el contrato Zod del backend (max 100).
 */
export const getTecnicos = () =>
    api.get('/api/usuarios', {
        params: { rol: 'TECNICO', limit: 100, estado: 'ACTIVO' },
    });