// src/features/hoy/views/hoy-layout-desktop.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';

export default function HoyLayoutDesktop() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const menu = useMemo(() => {
        const hoyModule = MODULES_CONFIG.find(m => m.id === 'hoy');
        const baseMenu = [
            { id: 'hoy-todas', label: 'Todas las Tareas', path: '/hoy/todas', icon: 'list_alt' },
            { id: 'hoy-actividades', label: 'Actividades', path: '/hoy/actividades', icon: 'engineering' },
            { id: 'hoy-mantenimientos', label: 'Mantenimientos', path: '/hoy/mantenimientos', icon: 'precision_manufacturing' },
        ];
        return baseMenu.filter(item => {
            const childConfig = hoyModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    if (menu.length === 0) return null;

    return (
        <div className="flex gap-3 sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full">
            {menu.map(item => {
                const isActive = location.pathname.includes(item.path);

                return (
                    <div key={item.id} className="relative">
                        <Button
                            size="sm"
                            variant={isActive ? 'primario' : 'ghost'}
                            icon={item.icon}
                            iconSize="md"
                            onClick={() => navigate(item.path)}
                            className={isActive ? 'shadow-md font-medium' : 'bg-white font-medium'}
                        >
                            {item.label}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
