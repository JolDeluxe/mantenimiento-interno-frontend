import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/ui-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import Sidebar from './components/sidebar.jsx';
import { Navbar } from './components/navbar.jsx';
import { Footer } from './components/footer.jsx';
import { Icon } from '@/components/ui/icon';
import { profileService } from '@/features/auth/api/profile-api.js';

export const DashboardLayout = () => {
  const isDesktop = useIsDesktop();
  const { sidebarExpanded, mobileMenuOpen, closeMobileMenu, setSidebarExpanded } = useUIStore();

  useEffect(() => {
    profileService.getProfile().catch((err) => {
      console.warn("Hydratación silenciosa de perfil fallida:", err.message);
    });
  }, []);

  // Lógica responsiva para cerrar sidebar en móvil
  useEffect(() => {
    if (!isDesktop && sidebarExpanded) {
      setSidebarExpanded(false);
    }
  }, [isDesktop, sidebarExpanded, setSidebarExpanded]);

  return (
    // overflow-hidden mata cualquier scroll global.
    <div className="h-dvh w-full flex bg-cuadra-arena overflow-hidden">
      
      {/* ESCRITORIO: Sidebar siempre fijo a la izquierda */}
      {isDesktop && (
        <div className="relative z-30 shrink-0 shadow-lg h-full">
          <Sidebar />
        </div>
      )}

      {/* MÓVIL: Drawer usando los tokens de la marca */}
      {!isDesktop && mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-marca-primario/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />
          
          <div className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden animate-in slide-in-from-left duration-300 shadow-2xl">
            <Sidebar />
            
            <button
              onClick={closeMobileMenu}
              className="absolute top-4 right-4 p-2 rounded-sm bg-marca-acento hover:bg-marca-secundario transition-colors shadow-md"
              aria-label="Cerrar menú"
            >
              <Icon name="close" size="24px" className="text-white" />
            </button>
          </div>
        </>
      )}

      {/* ÁREA DE CONTENIDO DERECHA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        
        {/* NAVBAR */}
        <div className="shrink-0">
          <Navbar />
        </div>

        {/* MAIN: Zona autorizada para hacer scroll */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-transparent custom-scrollbar">
          <Outlet />
        </main>

        {/* FOOTER */}
        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
};