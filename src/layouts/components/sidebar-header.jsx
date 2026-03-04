import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Tooltip } from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui-store';

export const SidebarHeader = () => {
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const tooltipText = sidebarExpanded ? 'Contraer menú' : 'Expandir menú';

  return (
    <div className="relative border-b border-marca-primario/20 py-6 h-20 flex items-center justify-center shrink-0">
      <div className="flex items-center justify-center px-4 w-full h-full">
        {sidebarExpanded ? (
          <img 
            src="/img/01_Cuadra.webp" 
            alt="Cuadra Mantenimiento" 
            className="h-10 w-auto object-contain animate-in fade-in zoom-in duration-300"
          />
        ) : (
          <img 
            src="/img/02_Cuadra_C_Logo.webp" 
            alt="Cuadra" 
            className="h-8 w-8 object-contain animate-in fade-in zoom-in duration-300"
          />
        )}
      </div>

      <Tooltip text={tooltipText} position="bottom">
        <button
          onClick={toggleSidebar}
          className="
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 flex items-center justify-center
            bg-white rounded-full
            shadow-md hover:shadow-lg
            transition-all duration-200 ease-out
            hover:scale-110 active:scale-95
            border-2 border-marca-primario
            cursor-pointer z-10 text-marca-primario
          "
          aria-label={tooltipText}
        >
          <Icon 
            name={sidebarExpanded ? 'chevron_left' : 'chevron_right'} 
            size="16px"
            className="text-marca-primario font-bold"
          />
        </button>
      </Tooltip>
    </div>
  );
};