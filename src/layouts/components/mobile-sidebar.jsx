import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

export const MobileSidebar = () => {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { user } = useAuthStore();

  const currentUser = user?.data || user;
  const userModules = currentUser?.rol ? getModulesByRole(currentUser.rol) : [];

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Overlay: Cristal oscuro sutil */}
      <div
        className="fixed inset-0 bg-marca-primario/30 backdrop-blur-[4px] z-40 animate-in fade-in duration-200"
        onClick={closeMobileMenu}
      />

      {/* Panel Liquid Glass: Arena translúcido con refracción fuerte */}
      <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-cuadra-arena/70 backdrop-blur-2xl saturate-[150%] border-l border-white/40 z-50 animate-in slide-in-from-right duration-300 shadow-[-12px_0_40px_rgba(0,0,0,0.12)] flex flex-col">

        {/* Header del Sidebar */}
        <div className="flex items-center justify-between p-5 border-b border-marca-primario/10 shrink-0">
          <span className="fuente-titulos text-marca-primario text-xl tracking-wide uppercase font-extrabold drop-shadow-sm">
            Navegación
          </span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-xl bg-white/40 hover:bg-white/60 border border-white/50 shadow-sm transition-all text-marca-primario active:scale-95 outline-none"
            aria-label="Cerrar menú"
          >
            <Icon name="close" size="24px" />
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
          <ul className="space-y-2.5">
            {userModules.map((module) => (
              <li key={module.id}>
                <NavLink
                  to={module.route}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3.5 outline-none select-none transition-transform active:scale-[0.98]"
                  style={({ isActive }) => (
                    isActive
                      ? { ...glassBase('primary'), borderRadius: '14px' }
                      : { borderRadius: '14px', background: 'transparent' }
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {/* Reflejo especular inyectado si está activo */}
                      {isActive && <GlassSheen />}

                      <Icon
                        name={module.icon}
                        size="md"
                        className={cn('shrink-0 relative transition-colors', isActive ? 'text-white' : 'text-marca-primario/60')}
                      />
                      <span className={cn('text-[15px] tracking-wide relative font-bold transition-colors', isActive ? 'text-white' : 'text-marca-primario/80')}>
                        {module.name}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-marca-primario/10 shrink-0 text-center bg-white/20">
          <p className="font-codigo text-[11px] text-marca-primario/60 tracking-[0.2em] font-semibold drop-shadow-sm">
            V. DESARROLLO
          </p>
        </div>
      </div>
    </>
  );
};