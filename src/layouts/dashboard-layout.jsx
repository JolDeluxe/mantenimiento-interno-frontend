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

  // WebSocket — conexión y listeners
  useEffect(() => {
    if (!currentUser?.id) return;
    socket.connect();

    const handleNotificacion = (data) => {
      increment(); // Sube el contador rojo global
      notify.info(data?.mensaje || "Tienes una nueva notificación.");

      triggerSync();

      // 🔥 Emitimos la señal para actualizar la bandeja en tiempo real
      window.dispatchEvent(new Event('refrescar-notificaciones'));
    };

    const handleDatosActualizados = (data) => {
      if (data?.module === "tickets") {
        triggerSync();
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