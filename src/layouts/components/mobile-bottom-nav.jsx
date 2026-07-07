import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassBottomNav, GlassBottomNavItem } from '@/components/ui/liquid-glass-mobile';
import { useUIStore } from '@/stores/ui-store';

// Recibe userModules directamente desde el Layout
export const MobileBottomNav = ({ userModules = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { badgeCounts } = useUIStore();
  if (userModules.length === 0) return null;

  return (
    <GlassBottomNav>
      {userModules.map((module) => {
        // Determinamos si la ruta actual coincide con la del módulo
        const isActive = location.pathname.startsWith(module.route);

        const count = module.id === 'bandeja' ? badgeCounts?.bandeja : (module.id === 'aprobar' ? badgeCounts?.aprobar : 0);
        const isBlinking = module.id === 'bandeja' && badgeCounts?.hasOldTickets;
        return (
          <GlassBottomNavItem
            key={module.id}
            icon={module.icon}
            label={module.name}
            isActive={isActive}
            onClick={() => navigate(module.route)}
            badge={count}
            isBlinking={isBlinking}
          />
        );
      })}
    </GlassBottomNav>
  );
};