// src/features/tickets/views/tickets-layout-desktop.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useTicketsUiStore } from '@/stores/tickets-ui-store';
// useTickets eliminado — esta vista es un Dumb Component que lee del store global.

export default function TicketsLayoutDesktop() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const unassignedCount = useTicketsUiStore((s) => s.unassignedCount);

    const menu = useMemo(() => {
        const ticketsModule = MODULES_CONFIG.find(m => m.id === 'tickets');
        const baseMenu = [
            { id: 'tickets-hoy', label: 'Tareas de Hoy', path: '/tickets/hoy', icon: 'today' },
            { id: 'tickets-bandeja', label: 'Bandeja de Entrada', path: '/tickets/bandeja', icon: 'inbox' },
            { id: 'tickets-historico', label: 'Historial', path: '/tickets/historico', icon: 'assignment_globe' },
        ];
        return baseMenu.filter(item => {
            const childConfig = ticketsModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    if (menu.length === 0) return null;

    return (
        <div className="flex gap-3 sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full">
            {menu.map(item => {
                const isActive = location.pathname.includes(item.path);
                const isBandeja = item.id === 'tickets-bandeja';

                return (
                    <div key={item.id} className="relative">
                        <Button
                            size="sm"
                            variant={isActive ? 'primario' : 'ghost'}
                            icon={item.icon}
                            iconSize="md"
                            onClick={() => navigate(item.path)}
                            className={isActive ? 'shadow-md' : 'bg-white'}
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