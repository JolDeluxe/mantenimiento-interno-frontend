import api, { handleError } from '@/lib/axios';

export const ticketsApi = {
  getTickets: async (params = {}) => {
    try {
      const response = await api.get('/api/tickets', { params });
      return response.data?.data || response.data || response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getTicketById: async (id) => {
    try {
      const response = await api.get(`/api/tickets/${id}`);
      return response.data?.data || response.data || response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  createTicketClient: async (payload) => {
    try {
      const response = await api.post('/api/tickets/cliente', payload);
      return response.data?.data || response.data || response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  createTicketAdmin: async (payload) => {
    try {
      const response = await api.post('/api/tickets/admin', payload);
      return response.data?.data || response.data || response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  changeStatus: async (id, payload) => {
    try {
      const response = await api.patch(`/api/tickets/${id}/status`, payload);
      return response.data?.data || response.data || response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
};