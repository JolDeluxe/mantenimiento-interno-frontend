import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/stores/ui-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { MODULES_CONFIG } from '@/config/modules-config';
import { UserMenu } from './user-menu';

export const Navbar = () => {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { toggleMobileMenu } = useUIStore();

  const activeModule = MODULES_CONFIG.find(m => m.route === location.pathname);

  return (
    <header className="
      bg-white border-b border-slate-200 shadow-sm
      sticky top-0 z-40
    ">
      {/* Grid de 3 columnas: Izquierda | Centro | Derecha */}
      <div className="grid grid-cols-3 items-center px-4 py-3 gap-4">
        
        {/* LEFT SECTION - Módulo Activo */}
        <div className="flex items-center gap-4 justify-self-start">
          {/* Mobile Menu Button */}
          {!isDesktop && (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <Icon name="menu" size="24px" className="text-marca-primario" />
            </button>
          )}

          {/* Module Info */}
          {activeModule && (
            <div className="flex items-center gap-2">
              <Icon 
                name={activeModule.icon} 
                size="24px" 
                className="text-marca-acento hidden sm:block"
              />
              <h1 className="fuente-titulos text-base sm:text-lg text-marca-primario uppercase hidden md:block">
                {activeModule.name}
              </h1>
            </div>
          )}
        </div>

        {/* CENTER SECTION - Logo */}
        <div className="flex items-center justify-center">
          <img 
            src="/img/01_Cuadra_Mantnimento.webp" 
            alt="Cuadra Mantenimiento" 
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>

        {/* RIGHT SECTION - Notificaciones + User Menu */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end">
          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-slate-100 transition-colors relative">
            <Icon name="notifications" size="24px" className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};