import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getNotificaciones,
  markAsRead,
  markAllAsRead,
  markActioned,
} from '../api/notificaciones-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';

export const useNotify = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    noLeidas: 0,
    totalPages: 1,
    page: 1,
  });

  const lastFetchParams = useRef({});

  const fetchNotificaciones = useCallback(async (params = {}, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    lastFetchParams.current = params;
    const cacheKey = `notif_${JSON.stringify(params)}`;

    // Cache primero
    const snapshot = await readSnapshot('notificaciones', cacheKey);
    if (snapshot?.data) {
      const cached = snapshot.data;
      const newItems = Array.isArray(cached.data) ? cached.data : [];

      setNotificaciones(prev => append ? [...prev, ...newItems] : newItems);
      setMeta({
        total: cached.pagination?.total ?? 0,
        noLeidas: cached.noLeidas ?? 0,
        totalPages: cached.pagination?.totalPages ?? 1,
        page: cached.pagination?.page ?? 1,
      });

      if (!snapshot.isStale && !navigator.onLine) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }
    }

    if (!navigator.onLine) {
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    try {
      const res = await getNotificaciones(params);
      const newItems = Array.isArray(res.data) ? res.data : [];

      setNotificaciones(prev => {
        if (!append) return newItems;
        // FILTRO DE SEGURIDAD: Evitar duplicados por ID
        const existingIds = new Set(prev.map(item => item.id));
        const filteredNew = newItems.filter(item => !existingIds.has(item.id));
        return [...prev, ...filteredNew];
      });

      setMeta({
        total: res.pagination?.total ?? 0,
        noLeidas: res.noLeidas ?? 0,
        totalPages: res.pagination?.totalPages ?? 1,
        page: res.pagination?.page ?? 1,
      });

      await writeSnapshot('notificaciones', res, cacheKey);
    } catch {
      if (!snapshot?.data && !append) setNotificaciones([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
      setMeta((prev) => ({ ...prev, noLeidas: Math.max(0, prev.noLeidas - 1) }));
    } catch { }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setSubmitting(true);
    try {
      await markAllAsRead();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setMeta((prev) => ({ ...prev, noLeidas: 0 }));
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleMarkActioned = useCallback(async (id) => {
    try {
      await markActioned(id);
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true, accionada: true } : n)));
      setMeta((prev) => ({ ...prev, noLeidas: Math.max(0, prev.noLeidas - 1) }));
    } catch { }
  }, []);

  // ── Motor Reactivo Offline ─────────────────────────────────────────────
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log('📡 [Hook Notify] Sincronización finalizada. Refrescando notificaciones...');
      if (Object.keys(lastFetchParams.current).length > 0 || notificaciones.length > 0) {
        // Al resincronizar tras offline, forzamos un reemplazo completo (append = false)
        // para asegurar consistencia con el backend.
        fetchNotificaciones(lastFetchParams.current, false);
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchNotificaciones, notificaciones.length]);

  return {
    notificaciones,
    loading,
    loadingMore,
    submitting,
    meta,
    fetchNotificaciones,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    markActioned: handleMarkActioned,
  };
};