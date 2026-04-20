// src/features/tickets/views/tickets-layout-mobile.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { useTickets } from '../hooks/use-tickets';

export default function TicketsLayoutMobile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    // CONSUMO PASIVO: No llamamos a fetchTickets(), solo leemos el meta global.
    const { meta } = useTickets();
    const unassignedCount = meta?.totalAbsoluto || 0;

    const { moduleInfo, menuOptions } = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'tickets');
        const baseMenuOptions = [
            { configId: 'tickets-hoy', id: '/tickets/hoy', label: 'Mi Día', icon: 'today' },
            { configId: 'tickets-bandeja', id: '/tickets/bandeja', label: 'Bandeja', icon: 'inbox' },
            { configId: 'tickets-historico', id: '/tickets/historico', label: 'Historial', icon: 'history' }
        ];

        const filteredOptions = baseMenuOptions.filter(opt => {
            const childConfig = config?.children?.find(c => c.id === opt.configId);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        }).map(({ configId, label, ...rest }) => {
            const isBandeja = configId === 'tickets-bandeja';
            const hasBadge = isBandeja && unassignedCount > 0;

            return {
                ...rest,
                label: hasBadge ? (
                    <div className="flex items-center gap-1.5">
                        <span>{label}</span>
                        <span className="relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none bg-amber-100 !text-amber-600">
                            {unassignedCount > 99 ? '99+' : unassignedCount}
                        </span>
                    </div>
                ) : label
            };
        });

        return {
            moduleInfo: {
                title: config?.name || 'Gestión de Tareas',
                description: 'Administra y resuelve las actividades de mantenimiento.'
            },
            menuOptions: filteredOptions
        };
    }, [currentUser?.rol, unassignedCount]);

    const activePath = menuOptions.find(opt => location.pathname === opt.id)?.id || (menuOptions[0]?.id || '/tickets/hoy');

    return (
        <div className="flex flex-col w-full">
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    {moduleInfo.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    {moduleInfo.description}
                </p>
            </div>

            {menuOptions.length > 0 && (
                <div className="sticky top-0 z-30 mb-3 py-1 flex items-center justify-center">
                    <div className="overflow-x-auto no-scrollbar w-full flex justify-center">
                        <GlassViewToggle
                            options={menuOptions}
                            value={activePath}
                            onChange={(newPath) => navigate(newPath)}
                            activeVariant="primary"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}