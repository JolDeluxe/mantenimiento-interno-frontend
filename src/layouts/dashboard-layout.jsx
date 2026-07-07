import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { profileService } from '@/features/auth/api/profile-api.js';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { RefreshFab } from '@/components/ui/z_index';
import { useNotifyStore } from '@/stores/notify-store';
import { getUnreadCount } from '@/features/notificaciones/api/notificaciones-api';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { subscribeToPush } from '@/lib/push';
import { notify } from '@/components/notification/adaptive-notify';
import socket from '@/lib/socket';
import { useSyncStore } from '@/stores/sync-store';
import api from '@/lib/axios';
import { useUIStore } from '@/stores/ui-store';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const { setNoLeidas, increment } = useNotifyStore();
  const triggerSync = useSyncStore((s) => s.triggerSync);

  // Hidratación de perfil
  useEffect(() => {
    if (currentUser?.id) {
      profileService.getMe()
        .then((response) => {
          const freshData = response?.data || response;
          if (freshData) useAuthStore.setState({ user: { ...currentUser, ...freshData } });
        })
        .catch((err) => console.warn('Hydratación silenciosa fallida:', err.message));
    }
  }, [currentUser?.id]);

  // Conteo inicial de no leídas
  useEffect(() => {
    if (!currentUser?.id) return;
    getUnreadCount()
      .then((res) => setNoLeidas(res?.count ?? 0))
      .catch(() => { });
  }, [currentUser?.id, setNoLeidas]);

  // Registro de Push Notifications
  useEffect(() => {
    const timeout = setTimeout(() => {
      subscribeToPush();
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Conteos globales para badges en layouts
  const setBadgeCounts = useUIStore((s) => s.setBadgeCounts);

  useEffect(() => {
    if (!currentUser?.id) return;
    const rolesPermitidos = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
    if (!rolesPermitidos.includes(currentUser.rol)) return;

    const loadBadgeCounts = async () => {
      try {
        const [resBandeja, resAprobar] = await Promise.all([
          api.get('/api/tickets', { params: { tipo: 'TICKET', estado: 'PENDIENTE', limit: 100 } }),
          api.get('/api/tickets', { params: { estado: 'RESUELTO', limit: 100 } })
        ]);

        const listBandeja = Array.isArray(resBandeja) ? resBandeja : (Array.isArray(resBandeja?.data) ? resBandeja.data : []);
        const countBandeja = listBandeja.length;

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const hasOldTickets = listBandeja.some(t => {
          const created = new Date(t.createdAt);
          return created <= twoDaysAgo;
        });

        const listAprobar = Array.isArray(resAprobar) ? resAprobar : (Array.isArray(resAprobar?.data) ? resAprobar.data : []);
        const countAprobar = listAprobar.length;

        setBadgeCounts({
          bandeja: countBandeja,
          hasOldTickets,
          aprobar: countAprobar
        });
      } catch (err) {
        console.warn('Error al cargar conteos de notificaciones:', err);
      }
    };

    loadBadgeCounts();

    // Poll cada 30 segundos
    const interval = setInterval(loadBadgeCounts, 30000);

    // Escuchadores de eventos para recargar conteos al instante
    window.addEventListener('refrescar-conteos', loadBadgeCounts);
    window.addEventListener('cuadra-sync-complete', loadBadgeCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refrescar-conteos', loadBadgeCounts);
      window.removeEventListener('cuadra-sync-complete', loadBadgeCounts);
    };
  }, [currentUser?.id, currentUser?.rol, setBadgeCounts]);

  // WebSocket — conexión y listeners
  useEffect(() => {
    if (!currentUser?.id) return;
    socket.connect();

    const handleNotificacion = (data) => {
      window.dispatchEvent(new Event('refrescar-conteos'));
      increment(); // Sube el contador rojo global
      notify.info(data?.mensaje || "Tienes una nueva notificación.");

      triggerSync();

      // 🔥 Emitimos la señal para actualizar la bandeja en tiempo real
      window.dispatchEvent(new Event('refrescar-notificaciones'));
    };

    const handleDatosActualizados = (data) => {
      if (data?.module === "tickets") {
        triggerSync();
        window.dispatchEvent(new Event('refrescar-conteos'));
      }
    };

    socket.on("notificacion_recibida", handleNotificacion);
    socket.on("datos_actualizados", handleDatosActualizados);

    return () => {
      socket.off("notificacion_recibida", handleNotificacion);
      socket.off("datos_actualizados", handleDatosActualizados);
      socket.disconnect();
    };
  }, [currentUser?.id, increment, triggerSync]);

  return (
    <>
      <OfflineBanner />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
      {isDesktop && (
        <div className="print:hidden">
          <RefreshFab zIndex={60} size={60} bottom="32px" />
        </div>
      )}
    </>
  );
};