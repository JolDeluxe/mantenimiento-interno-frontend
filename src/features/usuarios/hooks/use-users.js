// src/features/usuarios/hooks/use-users.js
import { useState, useCallback } from 'react';
import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  getDepartamentos,
} from '../api/users-api';

/**
 * Contrato de respuesta del backend /api/usuarios:
 * {
 *   status: "success",
 *   pagination: { total, page, limit, totalPages },  ← total = filas filtradas por rol/q/depto
 *   totalAbsoluto: number,                            ← total sin filtro de rol (para SummaryBar)
 *   resumenRoles: { JEFE_MTTO: n, ... },
 *   data: Usuario[]
 * }
 *
 * El interceptor de axios ya hace response.data, así que getUsers() devuelve
 * directamente el objeto anterior.
 */
export const useUsers = () => {
  const [users, setUsers]       = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * meta expone:
   *  - totalFiltrado  → para el paginador (cuántas filas coinciden con rol/q/depto)
   *  - totalAbsoluto  → para la SummaryBar (total del universo visible al usuario)
   *  - totalPages     → calculado por el backend
   *  - resumenRoles   → conteos por rol para las pastillas de filtro
   */
  const [meta, setMeta] = useState({
    totalFiltrado:  0,
    totalAbsoluto:  0,
    totalPages:     1,
    resumenRoles:   {},
  });

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getUsers(params);

      // Caso defensivo: si el interceptor devolviera un array directamente
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
        // pagination.total es el conteo de la tabla filtrada (lo que mueve el paginador)
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
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setDepartamentos(list);
    } catch {
      // silencioso — no rompe el flujo principal
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