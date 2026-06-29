// src/features/mantenimientos/views/mantenimientos-layout-desktop.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useTicketsUiStore } from '@/stores/tickets-ui-store';

export default function MantenimientosLayoutDesktop() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const unassignedCount = useTicketsUiStore((s) => s.unassignedCount);

    const menu = useMemo(() => {
        const maintModule = MODULES_CONFIG.find(m => m.id === 'mantenimientos');
        const baseMenu = [
            // { id: 'hoy-mantenimientos', label: 'Mantenimientos de Hoy', path: '/hoy/mantenimientos', icon: 'today' },
            { id: 'mantenimientos-aprobar', label: 'Por Aprobar', path: '/mantenimientos/aprobar', icon: 'check' },
            { id: 'mantenimientos-bandeja', label: 'Bandeja de Entrada', path: '/mantenimientos/bandeja', icon: 'inbox' },
            { id: 'mantenimientos-correctivos', label: 'Correctivos', path: '/mantenimientos/correctivos', icon: 'build' },
            { id: 'mantenimientos-preventivos', label: 'Preventivos', path: '/mantenimientos/preventivos', icon: 'event_note' },
            { id: 'mantenimientos-historico', label: 'Historial', path: '/mantenimientos/historico', icon: 'assignment' },
        ];
        return baseMenu.filter(item => {
            if (item.id === 'hoy-mantenimientos') {
                const hoyModule = MODULES_CONFIG.find(m => m.id === 'hoy');
                const childConfig = hoyModule?.children?.find(c => c.id === 'hoy-mantenimientos');
                return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
            }
            const childConfig = maintModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    if (menu.length === 0) return null;

    return (
        <div className="flex gap-3 sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full">
            {menu.map(item => {
                const isActive = location.pathname.includes(item.path);
                const isBandeja = item.id === 'mantenimientos-bandeja';

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

                        {isBandeja && unassignedCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold border-2 border-white shadow-md z-10 bg-amber-500 leading-none">
                                {unassignedCount > 99 ? '99+' : unassignedCount}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
