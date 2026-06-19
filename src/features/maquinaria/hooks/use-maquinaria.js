import { useState, useCallback } from 'react';
import * as api from '../api/maquinaria-api';
import { notify } from '@/components/notification/adaptive-notify';

export const useMaquinaria = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({
    q: '',
    estado: '',
    criticidad: '',
    planta: '',
    area: '',
    page: 1,
    limit: 20
  });

  const fetchMaquinas = useCallback(async (newFilters = {}) => {
    setLoading(true);
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    try {
      const res = await api.getMaquinas(updatedFilters);
      if (res?.data) {
        setMaquinas(res.data || []);
        setPagination({
          page: res.pagination?.page || 1,
          limit: res.pagination?.limit || 20,
          total: res.pagination?.total || 0,
          pages: res.pagination?.totalPages || res.pagination?.pages || 1
        });
      }
    } catch (err) {
      console.error(err);
      notify.error(err?.response?.data?.error || 'Error al cargar el catálogo de maquinaria.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createMaquina = useCallback(async (data) => {
    setSubmitting(true);
    try {
      const res = await api.createMaquina(data);
      notify.success('Máquina registrada exitosamente.');
      await fetchMaquinas();
      return { success: true, data: res.data };
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Error al registrar la máquina.';
      notify.error(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [fetchMaquinas]);

  const updateMaquina = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      const res = await api.updateMaquina(id, data);
      notify.success('Máquina actualizada correctamente.');
      await fetchMaquinas();
      return { success: true, data: res.data };
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Error al actualizar la máquina.';
      notify.error(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [fetchMaquinas]);

  const changeStatus = useCallback(async (id, estado) => {
    setSubmitting(true);
    try {
      const res = await api.patchMaquinaEstado(id, { estado });
      notify.success('Estado de la máquina actualizado.');
      await fetchMaquinas();
      return { success: true, data: res.data };
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || 'Error al actualizar el estado de la máquina.';
      notify.error(msg);
      return { success: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [fetchMaquinas]);

  const getKpis = useCallback(async (id, params = {}) => {
    try {
      const res = await api.getMaquinaKpis(id, params);
      return res.data || null;
    } catch (err) {
      console.error(err);
      notify.error('Error al cargar KPIs de la máquina.');
      return null;
    }
  }, []);

  const getDetails = useCallback(async (id) => {
    try {
      const res = await api.getMaquinaById(id);
      return res.data || null;
    } catch (err) {
      console.error(err);
      notify.error('Error al cargar detalle de la máquina.');
      return null;
    }
  }, []);

  return {
    maquinas,
    loading,
    submitting,
    pagination,
    filters,
    fetchMaquinas,
    createMaquina,
    updateMaquina,
    changeStatus,
    getKpis,
    getDetails
  };
};