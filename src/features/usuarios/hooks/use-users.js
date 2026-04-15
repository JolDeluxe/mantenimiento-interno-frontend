// src/features/usuarios/hooks/use-users.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  getDepartamentos,
} from '../api/users-api';

export const useUsers = () => {
  const [users, setUsers]       = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [meta, setMeta] = useState({
    totalFiltrado:  0,
    totalAbsoluto:  0,
    totalPages:     1,
    resumenRoles:   {},
  });

  // Motor Offline: Referencia de memoria para el contexto
  const lastFetchParams = useRef({});

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    lastFetchParams.current = params; // Guardamos filtro activo

    try {
      const response = await getUsers(params);

      if (Array.isArray(response)) {
        setUsers(response);
        setMeta({
          totalFiltrado: response.length,
          totalAbsoluto: response.length,
          totalPages:    1,
          resumenRoles:  {},
        });
        return;
      }

      const pagination   = response.pagination ?? {};
      const data         = Array.isArray(response.data) ? response.data : [];

      setUsers(data);
      setMeta({
        totalFiltrado:  pagination.total     ?? 0,
        totalAbsoluto:  response.totalAbsoluto ?? pagination.total ?? 0,
        totalPages:     pagination.totalPages ?? 1,
        resumenRoles:   response.resumenRoles ?? {},
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await getDepartamentos();
      const list = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      setDepartamentos(list);
    } catch {
      // silencioso
    }
  }, []);

  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try { return await createUser(data); }
    finally { setSubmitting(false); }
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    setSubmitting(true);
    try { return await updateUser(id, data); }
    finally { setSubmitting(false); }
  }, []);

  const handleToggleStatus = useCallback(async (id, estado) => {
    setSubmitting(true);
    try { return await updateUserStatus(id, estado); }
    finally { setSubmitting(false); }
  }, []);

  // ── Motor Reactivo Offline ─────────────────────────────────────────────
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log('📡 [Hook Users] Sincronización finalizada. Refrescando datos...');
      if (Object.keys(lastFetchParams.current).length > 0 || users.length > 0) {
        fetchUsers(lastFetchParams.current);
      }
      if (departamentos.length > 0) {
         fetchDepartamentos();
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchUsers, fetchDepartamentos, users.length, departamentos.length]);

  return {
    users,
    departamentos,
    meta,
    loading,
    submitting,
    fetchUsers,
    fetchDepartamentos,
    createUser:   handleCreate,
    updateUser:   handleUpdate,
    toggleStatus: handleToggleStatus,
  };
};