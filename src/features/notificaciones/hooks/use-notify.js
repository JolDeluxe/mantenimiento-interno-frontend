// src/features/notificaciones/hooks/use-notify.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getNotificaciones,
  markAsRead,
  markAllAsRead,
  markActioned,
} from '../api/notificaciones-api';

export const useNotify = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [meta, setMeta] = useState({
    total:      0,
    noLeidas:   0,
    totalPages: 1,
    page:       1,
  });

  const lastFetchParams = useRef({});

  const fetchNotificaciones = useCallback(async (params = {}) => {
    setLoading(true);
    lastFetchParams.current = params;

    try {
      const res = await getNotificaciones(params);
      setNotificaciones(Array.isArray(res.data) ? res.data : []);
      setMeta({
        total:      res.pagination?.total      ?? 0,
        noLeidas:   res.noLeidas               ?? 0,
        totalPages: res.pagination?.totalPages ?? 1,
        page:       res.pagination?.page       ?? 1,
      });
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
      setMeta((prev) => ({ ...prev, noLeidas: Math.max(0, prev.noLeidas - 1) }));
    } catch {}
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
    } catch {}
  }, []);

  // ── Motor Reactivo Offline ─────────────────────────────────────────────
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log('📡 [Hook Notify] Sincronización finalizada. Refrescando notificaciones...');
      if (Object.keys(lastFetchParams.current).length > 0 || notificaciones.length > 0) {
        fetchNotificaciones(lastFetchParams.current);
      }
    };

    window.addEventListener('cuadra-sync-complete', handleSyncComplete);
    return () => window.removeEventListener('cuadra-sync-complete', handleSyncComplete);
  }, [fetchNotificaciones, notificaciones.length]);

  return {
    notificaciones,
    loading,
    submitting,
    meta,
    fetchNotificaciones,
    markRead:     handleMarkRead,
    markAllRead:  handleMarkAllRead,
    markActioned: handleMarkActioned,
  };
};