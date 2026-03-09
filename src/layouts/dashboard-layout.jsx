import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { profileService } from '@/features/auth/api/profile-api.js';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();
  const { user } = useAuthStore();
  const currentUser = user?.data || user;

  useEffect(() => {
    if (currentUser?.id) {
      profileService.getMe()
        .then((response) => {
          const freshData = response?.data || response;
          if (freshData) {
            useAuthStore.setState({ user: { ...currentUser, ...freshData } });
          }
        })
        .catch((err) => {
          console.warn("Hydratación silenciosa de perfil fallida:", err.message);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  return isDesktop ? <DesktopLayout /> : <MobileLayout />;
};