import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/stores/ui-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { MODULES_CONFIG } from '@/config/modules-config';
import { UserMenu } from './user-menu';

const SYSTEM_ROUTES = [
  { route: '/perfil', name: 'Mi Perfil', icon: 'person' }
];

export const Navbar = () => {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { toggleMobileMenu, sidebarExpanded } = useUIStore();

  // Referencia física al DOM del Navbar
  const navRef = useRef(null);

  // Motor de medición exacta (ResizeObserver)
  useLayoutEffect(() => {
    if (!navRef.current) return;

    const updateHeight = () => {
      // Obtenemos la altura con precisión de sub-píxeles
      const height = navRef.current.getBoundingClientRect().height;
      // Inyectamos la variable matemáticamente exacta en el :root
      document.documentElement.style.setProperty('--navbar-real-height', `${height}px`);
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(navRef.current);

    // Disparo inicial
    updateHeight();

    return () => observer.disconnect();
  }, []);

  const activeModule = useMemo(() => {
    const allRoutes = [...MODULES_CONFIG, ...SYSTEM_ROUTES];
    return allRoutes.find(module => {
      if (module.route === location.pathname) return true;
      if (module.children) {
        return module.children.some(child => child.route === location.pathname);
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
        {/* LEFT SECTION - Módulo Activo */}
        <div className="flex items-center gap-4 justify-self-start">
          {!isDesktop && (
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <Icon name="menu" size="24px" className="text-marca-primario" />
            </button>
          )}

          {activeModule && (
            <div className="flex items-center gap-2">
              <Icon
                name={activeModule.icon}
                size={!sidebarExpanded ? "32px" : "24px"}
                className="text-marca-acento hidden sm:block transition-all duration-300"
              />
              <h1
                className={`fuente-titulos text-marca-primario uppercase hidden md:block transition-all duration-300 ${!sidebarExpanded
                  ? "text-xl sm:text-2xl"
                  : "text-base sm:text-lg"
                  }`}
              >
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
          <button className="p-2 rounded-md hover:bg-slate-100 transition-colors relative">
            <Icon name="notifications" size="24px" className="text-slate-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};