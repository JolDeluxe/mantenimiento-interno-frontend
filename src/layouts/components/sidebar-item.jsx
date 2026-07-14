import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { useUIStore } from '@/stores/ui-store';

export const SidebarItem = ({ module }) => {
  const { sidebarExpanded, closeMobileMenu, badgeCounts } = useUIStore();
  const count = module.id === 'bandeja' ? badgeCounts?.bandeja : (module.id === 'aprobar' ? badgeCounts?.aprobar : 0);
  const isBlinking = module.id === 'bandeja' && badgeCounts?.hasOldTickets;
  const location = useLocation();

  const hasChildren = module.children && module.children.length > 0;
  const isActiveChild = hasChildren && module.children.some(child => location.pathname.includes(child.route));
  const [isOpen, setIsOpen] = useState(isActiveChild);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sidebarExpanded) setIsOpen(false);
    else if (isActiveChild) setIsOpen(true);
  }, [sidebarExpanded, isActiveChild]);

  const handleParentClick = (e) => {
    if (hasChildren) {
      if (!sidebarExpanded) {
        closeMobileMenu();
      } else {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    } else {
      closeMobileMenu();
    }
  };

  return (
    <li className="relative group flex flex-col">
      <Tooltip text={module.name} position="right" offset={12} disabled={sidebarExpanded}>
        <NavLink
          to={module.route}
          onClick={handleParentClick}
          className={({ isActive }) => `
            sidebar-item-link flex items-center px-4 py-3 rounded-sm transition-all duration-200 relative w-full
            ${(isActive && !hasChildren) || isActiveChild
              ? 'bg-marca-acento text-white font-semibold shadow-lg max-lg:border max-lg:border-white/20 max-lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
              : 'text-white/80 hover:bg-marca-primario/30 hover:text-white'
            }
          `}
        >
          <Icon name={module.icon} size="24px" className="sidebar-item-icon shrink-0" />

          {!sidebarExpanded && count > 0 && (
            <span className={`
              absolute top-1 right-1 flex items-center justify-center rounded-full text-[9px] font-extrabold leading-none text-white border-2 border-white shadow-sm
              ${count > 9 ? 'px-1 h-[18px] min-w-[18px]' : 'h-[18px] w-[18px]'}
              bg-estado-rechazado ${isBlinking ? 'animate-pulse' : ''}
            `}>
              {count > 99 ? '99+' : count}
            </span>
          )}

          <span className={`
            ml-3 text-sm text-left transition-all duration-300 ease-in-out whitespace-nowrap
            ${sidebarExpanded ? 'flex-1 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4 overflow-hidden'}
          `}>
            {module.name}
          </span>

          {sidebarExpanded && count > 0 && (
            <span className={`
              ml-auto flex items-center justify-center rounded-full text-[9px] font-extrabold leading-none text-white border-2 border-white shadow-sm transition-all duration-300
              ${count > 9 ? 'px-1 h-[18px] min-w-[18px]' : 'h-[18px] w-[18px]'}
              bg-estado-rechazado ${isBlinking ? 'animate-pulse' : ''}
            `}>
              {count > 99 ? '99+' : count}
            </span>
          )}

          {hasChildren && sidebarExpanded && (
            <Icon
              name="expand_more"
              className={`shrink-0 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            />
          )}
        </NavLink>
      </Tooltip>

      {hasChildren && (
        <div
          className={`
            grid transition-all duration-300 ease-in-out overflow-hidden
            ${isOpen && sidebarExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-1'
              : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
            }
          `}
        >
          <ul className="sidebar-child-list min-h-0 flex flex-col gap-1 pl-11 pr-2 relative">
            <div className="sidebar-child-line absolute left-[23px] top-0 bottom-2 w-[1.5px] bg-white/10 rounded-full" />

            {module.children.map(child => (
              <li key={child.id} className="relative">
                <NavLink
                  to={child.route}
                  onClick={() => closeMobileMenu()}
                  className={({ isActive }) => `
                    sidebar-child-link flex items-center px-3 py-2 rounded-sm text-sm transition-all duration-200 relative
                    ${isActive
                      ? 'text-marca-acento font-bold bg-white/10 shadow-[inset_0_0_8px_rgba(255,255,255,0.05)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {location.pathname.includes(child.route) && (
                    <div className="sidebar-child-dot absolute left-[-21px] w-3 h-[1.5px] bg-marca-acento shadow-[0_0_5px_var(--color-marca-acento)]" />
                  )}

                  <span className="whitespace-nowrap">{child.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};