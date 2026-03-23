// src/features/tickets/hooks/use-tickets.js
import { useState, useCallback } from 'react';
import {
  getTickets,
  createTicket,
  updateTicket,
  changeTicketStatus,
  getTecnicos,
  getTicketMetrics,
} from '../api/tickets-api';

/**
 * Contrato de respuesta del backend /api/tickets:
 * {
 *   status: "success",
 *   pagination: { total, page, limit, totalPages },
 *   data: Ticket[]
 * }
 *
 * Contrato de respuesta del backend /api/tickets/metrics:
 * {
 *   status: "success",
 *   data: {
 *     distribucion: { porEstado: { PENDIENTE: n, ASIGNADA: n, ... } }
 *   }
 * }
 *
 * El interceptor de axios ya hace response.data, así que ambas funciones
 * devuelven directamente el objeto anterior.
 */
export const useTickets = () => {
  const [tickets,    setTickets]    = useState([]);
  const [tecnicos,   setTecnicos]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * meta expone:
   *  - totalFiltrado   → para el paginador
   *  - totalPages      → calculado por el backend
   *  - resumenEstados  → { PENDIENTE: n, ASIGNADA: n, ... } para la SummaryBar
   */
  const [meta, setMeta] = useState({
    totalFiltrado:  0,
    totalPages:     1,
    resumenEstados: {},
  });

  // ── Lista principal + conteos en paralelo ────────────────────────────────
  const fetchTickets = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const [listResult, metricsResult] = await Promise.allSettled([
        getTickets(params),
        getTicketMetrics(params),
      ]);

      // Procesa la lista
      if (listResult.status === 'fulfilled') {
        const res = listResult.value;

        if (Array.isArray(res)) {
          setTickets(res);
          setMeta((prev) => ({ ...prev, totalFiltrado: res.length, totalPages: 1 }));
        } else {
          const pagination = res.pagination ?? {};
          setTickets(Array.isArray(res.data) ? res.data : []);
          setMeta((prev) => ({
            ...prev,
            totalFiltrado: pagination.total     ?? 0,
            totalPages:    pagination.totalPages ?? 1,
          }));
        }
      }

      // Procesa los conteos por estado para la SummaryBar
      if (metricsResult.status === 'fulfilled') {
        const m = metricsResult.value;
        // El backend devuelve data.distribucion.porEstado (ver 06_metrics.ts)
        const porEstado =
          m?.data?.distribucion?.porEstado ??
          m?.distribucion?.porEstado ??
          {};
        setMeta((prev) => ({ ...prev, resumenEstados: porEstado }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Técnicos activos para asignación ────────────────────────────────────
  const fetchTecnicos = useCallback(async () => {
    try {
      const response = await getTecnicos();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setTecnicos(list);
    } catch {
      // silencioso — no rompe el flujo principal
    }
  }, []);

  // ── Mutaciones ────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try { return await createTicket(data); }
    finally { setSubmitting(false); }
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    setSubmitting(true);
    try { return await updateTicket(id, data); }
    finally { setSubmitting(false); }
  }, []);

  const handleChangeStatus = useCallback(async (id, data) => {
    setSubmitting(true);
    try { return await changeTicketStatus(id, data); }
    finally { setSubmitting(false); }
  }, []);

  return {
    tickets,
    tecnicos,
    meta,
    loading,
    submitting,
    fetchTickets,
    fetchTecnicos,
    createTicket:  handleCreate,
    updateTicket:  handleUpdate,
    changeStatus:  handleChangeStatus,
  };
};