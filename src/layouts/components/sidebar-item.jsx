import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { Tooltip } from '@/components/ui/tooltip';
import { useUIStore } from '@/stores/ui-store';

export const SidebarItem = ({ module }) => {
  const { sidebarExpanded, closeMobileMenu } = useUIStore();

  const handleClick = () => {
    closeMobileMenu();
  };

  return (
    <li className="relative group">
      <Tooltip 
        text={module.name} 
        position="right" 
        offset={12} 
        disabled={sidebarExpanded}
      >
        <NavLink
          to={module.route}
          onClick={handleClick}
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-sm
            transition-all duration-200 relative
            ${isActive 
              ? 'bg-marca-acento text-white font-semibold shadow-md' 
              : 'text-white/80 hover:bg-marca-primario/20 hover:text-white'
            }
          `}
        >
          <Icon 
            name={module.icon} 
            size="24px"
            className="shrink-0"
          />
          
          <span className={`
            whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
            ${sidebarExpanded ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4'}
          `}>
            {module.name}
          </span>
        </NavLink>
      </Tooltip>
    </li>
  );
};