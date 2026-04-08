// src/layouts/dashboard-layout.jsx
import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { profileService } from '@/features/auth/api/profile-api.js';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { RefreshFab } from '@/components/ui/z_index';

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
  }, [currentUser?.id]);

  return (
    <>
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}

      {/* BOTÓN GLOBAL 
          Solo se renderiza en Desktop.
          En Móvil, cada vista (Capa 2) renderiza y apila sus propios FABs 
          dinámicamente dependiendo de si hay paginador, botón de añadir, etc.
      */}
      {isDesktop && (
        <div className="print:hidden">
          <RefreshFab
            zIndex={60}
            size={48}
            bottom="32px"
          />
        </div>
      )}
    </>
  );
};