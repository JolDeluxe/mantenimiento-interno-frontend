import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { getModulesByRole } from '@/config/modules-config';
import { SidebarHeader } from './sidebar-header';
import { SidebarItem } from './sidebar-item';

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarExpanded } = useUIStore();
  const userModules = getModulesByRole(user?.rol);

  return (
    <aside className={`
      h-full flex flex-col relative
      transition-all duration-300 ease-in-out
      ${sidebarExpanded ? 'w-72' : 'w-20'}

      /* ESCRITORIO (lg:) -> Sólido e institucional */
      lg:bg-marca-secundario lg:backdrop-blur-none lg:shadow-none lg:border-none

      /* MÓVIL (max-lg:) -> Liquid Glass Profundo */
      max-lg:bg-marca-secundario/80 max-lg:backdrop-blur-2xl max-lg:saturate-[1.3] 
      max-lg:border-r max-lg:border-white/10 max-lg:shadow-[0_0_40px_rgba(0,0,0,0.3)]
    `}>
      <SidebarHeader />

      <nav className="flex-1 overflow-visible py-4 px-2 hover:overflow-y-auto custom-scrollbar">
        <ul className="space-y-1 relative">
          {userModules.map((module) => (
            <SidebarItem key={module.id} module={module} />
          ))}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      <div className={`
        p-4 border-t border-marca-primario/30 mt-auto flex flex-col items-center
        transition-all duration-300 overflow-hidden
        ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}
      `}>
        <p className="fuente-titulos text-white text-xl tracking-wide whitespace-nowrap">
          Cuadra Mantenimiento
        </p>

        <p className="font-codigo text-[10px] bg-marca-primario/50 text-cuadra-arena px-2 py-0.5 rounded-sm mt-1 mb-3 whitespace-nowrap shadow-inner">
          v.desarrollo
        </p>

        <p className="text-[10px] text-white/50 text-center leading-tight">
          Desarrollado por el equipo de <br />
          <span className="font-bold text-white/80">Procesos Tecnológicos</span>
        </p>
      </div>
    </aside>
  );
};