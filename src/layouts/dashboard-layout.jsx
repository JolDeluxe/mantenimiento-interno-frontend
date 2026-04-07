import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { profileService } from '@/features/auth/api/profile-api.js';
import { DesktopLayout } from './desktop-layout.jsx';
import { MobileLayout } from './mobile-layout.jsx';
import { RefreshFab } from '@/components/ui/z_index'; // Importación centralizada

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
          zIndex 60 para estar por encima de Sidebars y Headers 
          En móvil se posiciona automáticamente por los props default del componente
      */}
      <div className="print:hidden">
        <RefreshFab
          zIndex={60}
          size={isDesktop ? 48 : 50}
          bottom={isDesktop ? "32px" : "145px"} // Ajuste para no tapar el GlassPaginationPill en móvil
        />
      </div>
    </>
  );
};