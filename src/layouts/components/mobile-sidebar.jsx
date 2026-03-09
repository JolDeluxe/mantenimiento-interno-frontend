import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';

export const MobileSidebar = () => {
  const { mobileMenuOpen, closeMobileMenu } = useUIStore();
  const { user } = useAuthStore();
  
  const currentUser = user?.data || user;
  
  const userModules = currentUser?.rol ? getModulesByRole(currentUser.rol) : [];

  if (!mobileMenuOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-marca-primario/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={closeMobileMenu}
      />
      
      <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-cuadra-arena z-50 animate-in slide-in-from-right duration-300 shadow-2xl flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-marca-primario/10 shrink-0">
          <span className="fuente-titulos text-marca-primario text-lg tracking-wide uppercase">
            Navegación
          </span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-sm bg-marca-primario/5 hover:bg-marca-primario/10 transition-colors text-marca-primario"
            aria-label="Cerrar menú"
          >
            <Icon name="close" size="24px" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <ul className="space-y-2">
            {userModules.map((module) => (
              <li key={module.id}>
                <NavLink
                  to={module.route}
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-3.5 rounded-sm transition-colors
                    ${isActive 
                      ? 'bg-marca-acento text-white font-semibold shadow-sm' 
                      : 'text-marca-primario/70 hover:bg-marca-primario/10 hover:text-marca-primario'
                    }
                  `}
                >
                  <Icon name={module.icon} size="24px" className="shrink-0" />
                  <span className="text-base tracking-wide">{module.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-marca-primario/10 shrink-0 text-center">
          <p className="font-codigo text-[11px] text-marca-primario/50 tracking-widest">
            V. DESARROLLO
          </p>
        </div>
      </div>
    </>
  );
};