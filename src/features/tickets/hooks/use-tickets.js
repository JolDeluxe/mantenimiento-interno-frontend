import { useState, useCallback } from 'react';
import { ticketsApi } from '../api/tickets-api';
import { notify } from '@/components/notification/adaptive-notify';

export const useTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const fetchTickets = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const data = await ticketsApi.getTickets(filters);
      setTickets(data.items || []);
      if (data.meta) {
        setPagination({
          page: data.meta.currentPage,
          limit: data.meta.perPage,
          total: data.meta.totalItems
        });
      }
    } catch (error) {
      notify.error('No se pudieron cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id, newStatus, extraPayload = {}) => {
    setIsMutating(true);
    try {
      await ticketsApi.changeStatus(id, { estado: newStatus, ...extraPayload });
      notify.success(`Ticket actualizado a ${newStatus}`);
      // Refrescar lista localmente sin recargar si es necesario, 
      // o invocar fetchTickets de nuevo.
      setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: newStatus } : t));
      return true;
    } catch (error) {
      // El error ya fue manejado por el interceptor y mostrado con Toastify
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    tickets,
    pagination,
    isLoading,
    isMutating,
    fetchTickets,
    updateStatus
  };
};