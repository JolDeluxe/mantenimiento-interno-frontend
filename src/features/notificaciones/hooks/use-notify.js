// src/features/notificaciones/hooks/use-notify.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getNotificaciones,
  markAsRead,
  markAllAsRead,
  markActioned,
} from '../api/notificaciones-api';
import { readSnapshot, writeSnapshot } from '@/lib/idb';
import { useSyncStore } from '@/stores/sync-store'; // 🟢 1. Importamos el cerebro

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

  // 🟢 2. Suscripción atómica al reloj de Sockets
  const lastUpdate = useSyncStore((state) => state.lastUpdate);
  const isFirstRender = useRef(true);

  const fetchNotificaciones = useCallback(async (params = {}, append = false, silent = false) => {
    if (!silent) {
      if (append) setLoadingMore(true);
      else setLoading(true);
    }

    lastFetchParams.current = params;
    const cacheKey = `notif_${JSON.stringify(params)}`;

    if (!silent) {
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
    }

    if (!navigator.onLine) {
      if (!silent) {
        setLoading(false);
        setLoadingMore(false);
      }
      return;
    }

    try {
      // 🟢 3. CACHE-BUSTER: Garantiza que la petición no devuelva datos viejos del navegador
      const finalParams = silent ? { ...params, _t: Date.now() } : params;

      const res = await getNotificaciones(finalParams);
      const newItems = Array.isArray(res.data) ? res.data : [];

      setNotificaciones(prev => {
        if (!append) return newItems;

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

      // Solo guardamos en base de datos local (Offline) si no fue una petición silenciosa parcial
      if (!silent) {
        await writeSnapshot('notificaciones', res, cacheKey);
      }
    } catch {
      if (!append && !silent) setNotificaciones([]);
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

  // 🟢 4. MOTOR REACTIVO: Reacciona a Zustand en lugar de depender de Window Events
  useEffect(() => {
    // Evita ejecutarse en la carga inicial de React
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (Object.keys(lastFetchParams.current).length > 0) {
      console.log('🔄 [Hook Notify] Signal detectado. Recargando bandeja silenciosamente...');
      fetchNotificaciones(lastFetchParams.current, false, true);
    }
  }, [lastUpdate, fetchNotificaciones]);

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