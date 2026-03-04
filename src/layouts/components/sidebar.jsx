import React from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { getModulesByRole } from '@/config/modules-config';
import { SidebarHeader } from './sidebar-header';
import { SidebarItem } from './sidebar-item';

const Sidebar = () => {
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

      <div className={`
        p-4 border-t border-marca-primario/20 mt-auto
        transition-all duration-300
        ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}
      `}>
        <p className="text-white/80 text-xs text-center font-medium">
          Cuadra Mantenimiento
        </p>
        <p className="text-white/60 text-xs text-center mt-1">
          v - desarrollo
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;