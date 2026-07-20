import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileSidebar } from './components/mobile-sidebar.jsx';
import { MobileBottomNav } from './components/mobile-bottom-nav.jsx';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/utils/cn';

export const MobileLayout = () => {
  // Calculamos los módulos permitidos una sola vez a nivel de Layout
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const userModules = currentUser?.rol ? getModulesByRole(currentUser.rol) : [];
  const setIsBottomNav = useUIStore(s => s.setIsBottomNav);

  // Lógica adaptativa de UI
  const showBottomNav = userModules.length > 0 && userModules.length <= 5;
  const showSidebar = userModules.length > 5;

  useEffect(() => {
    setIsBottomNav(showBottomNav);
  }, [showBottomNav, setIsBottomNav]);

  return (
    <div className="h-dvh w-full flex flex-col bg-cuadra-arena overflow-hidden relative">

      {/* LIQUID GLASS HEADER */}
      <div className="shrink-0 z-30 bg-cuadra-arena/70 backdrop-blur-2xl saturate-[150%] border-b border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative">
        <MobileHeader showBurger={showSidebar} />
      </div>

      {/* SIDEBAR MÓVIL (Condicional: > 5 módulos) */}
      {showSidebar && <MobileSidebar userModules={userModules} />}

      {/* MAIN CONTENT
        Si usamos BottomNav, agregamos pb-32 para que el contenido no quede
        escondido detrás del cristal de la barra inferior.
      */}
      <main className={cn(
        "flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar relative z-10",
        showBottomNav ? "pb-32" : ""
      )}>
        <Outlet />
      </main>

      {/* BOTTOM NAV (Condicional: <= 5 módulos) */}
      {showBottomNav && <MobileBottomNav userModules={userModules} />}

    </div>
  );
};