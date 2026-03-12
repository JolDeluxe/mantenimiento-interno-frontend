// src/features/usuarios/hooks/use-users.js
import { useState, useCallback } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  getDepartamentos,
} from '../api/users-api';

export const useUsers = () => {
  const [users, setUsers]                 = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [meta, setMeta]                   = useState({ totalItems: 0, totalPages: 1, resumenRoles: {} });
  const [loading, setLoading]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getUsers(params);

      // El interceptor de axios.js ya desenvuelve response.data internamente.
      // Si el resultado es un array plano → el interceptor extrajo solo 'data'
      // Si el resultado tiene .data → llegó el body completo del backend
      if (Array.isArray(response)) {
        setUsers(response);
        setMeta({
          totalItems:   response.length,
          totalPages:   1,
          resumenRoles: {},
        });
      } else {
        setUsers(response.data ?? []);
        const p = response.pagination ?? {};
        setMeta({
          totalItems:   p.total      ?? 0,
          totalPages:   p.totalPages ?? 1,
          resumenRoles: response.resumenRoles ?? {},
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await getDepartamentos();
      setDepartamentos(
        Array.isArray(response) ? response : (response.data ?? response ?? [])
      );
    } catch {
      // silencioso
    }
  }, []);

  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try { await createUser(data); }
    finally { setSubmitting(false); }
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    setSubmitting(true);
    try { await updateUser(id, data); }
    finally { setSubmitting(false); }
  }, []);

  const handleToggleStatus = useCallback(async (id, estado) => {
    setSubmitting(true);
    try { await updateUserStatus(id, estado); }
    finally { setSubmitting(false); }
  }, []);

  return {
    users,
    departamentos,
    meta,
    loading,
    submitting,
    fetchUsers,
    fetchDepartamentos,
    createUser: handleCreate,
    updateUser: handleUpdate,
    toggleStatus: handleToggleStatus,
  };
};