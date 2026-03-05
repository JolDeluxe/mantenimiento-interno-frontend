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
      bg-marca-secundario h-full flex flex-col relative
      transition-all duration-300 ease-in-out
      ${sidebarExpanded ? 'w-64' : 'w-20'}
    `}>
      <SidebarHeader />

      {/* overflow-visible permite que el tooltip salga del contenedor sin decapitarse */}
      <nav className="flex-1 overflow-visible py-4 px-2 hover:overflow-y-auto">
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
        {/* Nombre del sistema con fuente corporativa */}
        <p className="fuente-titulos text-white text-xl tracking-wide whitespace-nowrap">
          Cuadra Mantenimiento
        </p>
        
        {/* Versión con fuente monoespaciada en formato badge */}
        <p className="font-codigo text-[10px] bg-marca-primario/50 text-cuadra-arena px-2 py-0.5 rounded-sm mt-1 mb-3 whitespace-nowrap shadow-inner">
          v.desarrollo
        </p>
        
        {/* Créditos de autoría sutiles */}
        <p className="text-[10px] text-white/50 text-center leading-tight">
          Desarrollado por el equipo de <br/>
          <span className="font-bold text-white/80">Procesos Tecnológicos</span>
        </p>
      </div>
    </aside>
  );
};
