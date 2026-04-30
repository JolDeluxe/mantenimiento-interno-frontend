import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassBottomNav, GlassBottomNavItem } from '@/components/ui/liquid-glass-mobile';

// Recibe userModules directamente desde el Layout
export const MobileBottomNav = ({ userModules = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (userModules.length === 0) return null;

  return (
    <GlassBottomNav>
      {userModules.map((module) => {
        // Determinamos si la ruta actual coincide con la del módulo
        const isActive = location.pathname.startsWith(module.route);

        return (
          <GlassBottomNavItem
            key={module.id}
            icon={module.icon}
            label={module.name}
            isActive={isActive}
            onClick={() => navigate(module.route)}
          />
        );
      })}
    </GlassBottomNav>
  );
};