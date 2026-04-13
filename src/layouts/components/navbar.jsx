import React, { useMemo, useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/stores/ui-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { MODULES_CONFIG } from '@/config/modules-config';
import { UserMenu } from './user-menu';
import { NotifyDropdown } from '@/features/notificaciones/components/notify-dropdown';
import { NotifyBadge } from '@/features/notificaciones/components/notify-badge';
import { useNotifyStore } from '@/stores/notify-store';

const SYSTEM_ROUTES = [
  { route: '/perfil', name: 'Mi Perfil', icon: 'person' },
  { route: '/notificaciones', name: 'Notificaciones', icon: 'notifications' },
];

export const Navbar = () => {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { toggleMobileMenu, sidebarExpanded } = useUIStore();
  const { noLeidas } = useNotifyStore();
  const navRef = useRef(null);
  const bellRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Cierra dropdown al hacer clic fuera
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOut = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOut);
    return () => document.removeEventListener('mousedown', handleOut);
  }, [dropdownOpen]);

  useLayoutEffect(() => {
    if (!navRef.current) return;
    const updateHeight = () => {
      const height = navRef.current.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--navbar-real-height', `${height}px`);
    };
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navRef.current);
    updateHeight();
    return () => observer.disconnect();
  }, []);

  const activeModule = useMemo(() => {
    const allRoutes = [...MODULES_CONFIG, ...SYSTEM_ROUTES];
    return allRoutes.find((module) => {
      if (module.route === location.pathname) return true;
      if (module.children) {
        return module.children.some((child) => child.route === location.pathname);
      }
      return false;
    });
  }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40"
    >
      <div className="grid grid-cols-3 items-center px-4 py-3 gap-4">

        {/* LEFT — módulo activo */}
        <div className="flex items-center gap-4 justify-self-start">
          {!isDesktop && (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors lg:hidden"
            >
              <Icon name="menu" size="24px" className="text-marca-primario" />
            </button>
          )}
          {activeModule && (
            <div className="flex items-center gap-2">
              <Icon
                name={activeModule.icon}
                size={!sidebarExpanded ? '32px' : '24px'}
                className="text-marca-acento hidden sm:block transition-all duration-300"
              />
              <h1 className={`fuente-titulos text-marca-primario uppercase hidden md:block transition-all duration-300 ${!sidebarExpanded ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                {activeModule.name}
              </h1>
            </div>
          )}
        </div>

        {/* CENTER — logo */}
        <div className="flex items-center justify-center">
          <img
            src="/img/01_Cuadra_Mantnimento.webp"
            alt="Cuadra Mantenimiento"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>

        {/* RIGHT — campana + user menu */}
        <div className="flex items-center gap-2 sm:gap-4 justify-end">

          {/* Campana — Desktop: dropdown | Mobile: oculto aquí (está en mobile-header) */}
          <div ref={bellRef} className="relative hidden lg:block">
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="Notificaciones"
            >
              <Icon name="notifications" size="24px" className="text-slate-600" />
              <NotifyBadge count={noLeidas} />
            </button>

            {dropdownOpen && (
              <NotifyDropdown onClose={() => setDropdownOpen(false)} />
            )}
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  );
};