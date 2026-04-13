import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { profileService } from '@/features/auth/api/profile-api.js';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { RefreshFab } from '@/components/ui/z_index';
import { useNotifyStore } from '@/stores/notify-store';
import { getUnreadCount } from '@/features/notificaciones/api/notificaciones-api';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const { setNoLeidas } = useNotifyStore();

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
      .catch(() => { }); // silencioso
  }, [currentUser?.id, setNoLeidas]);

  return (
    <>
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}

      {isDesktop && (
        <div className="print:hidden">
          <RefreshFab zIndex={60} size={48} bottom="32px" />
        </div>
      )}
    </>
  );
};