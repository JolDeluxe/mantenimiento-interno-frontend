// src/features/tickets/views/tickets-layout-mobile.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getTickets } from '../api/tickets-api';

const calculateDaysWaiting = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const today = new Date();
    created.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

export default function TicketsLayoutMobile({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const userRole = currentUser?.rol;

    const canAccessBandeja = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'tickets');
        const childConfig = config?.children?.find(c => c.id === 'tickets-bandeja');
        return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
    }, [userRole]);

    const [unassignedCount, setUnassignedCount] = useState(0);
    const [hasCritical, setHasCritical] = useState(false);

    useEffect(() => {
        if (!canAccessBandeja) return;

        let isMounted = true;
        const fetchCount = async () => {
            try {
                const response = await getTickets({ tipo: 'TICKET', estado: 'PENDIENTE' });

                if (isMounted) {
                    const rawData = response?.data?.data || response?.data;
                    const ticketsData = Array.isArray(rawData) ? rawData : [];

                    const unassigned = ticketsData.filter(t => !t.responsables || t.responsables.length === 0);
                    const isCritical = unassigned.some(t => calculateDaysWaiting(t.createdAt) >= 3);

                    setUnassignedCount(unassigned.length);
                    setHasCritical(isCritical);
                }
            } catch (error) {
                console.warn("Error al obtener conteo de bandeja:", error);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [canAccessBandeja]);

    const { moduleInfo, menuOptions } = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'tickets');

        const baseMenuOptions = [
            { configId: 'tickets-hoy', id: '/tickets/hoy', label: 'Mi Día', icon: 'today' },
            { configId: 'tickets-bandeja', id: '/tickets/bandeja', label: 'Bandeja', icon: 'inbox' },
            { configId: 'tickets-historico', id: '/tickets/historico', label: 'Historial', icon: 'history' }
        ];

        const filteredOptions = baseMenuOptions.filter(opt => {
            const childConfig = config?.children?.find(c => c.id === opt.configId);
            return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
        }).map(({ configId, label, icon, ...rest }) => {
            const isBandeja = configId === 'tickets-bandeja';
            const hasBadge = isBandeja && unassignedCount > 0;
            const isActive = location.pathname.includes(rest.id);

            // Evaluamos si debe teñir de rojo todo el botón.
            const showRedAlert = isBandeja && hasCritical && !isActive;

            return {
                ...rest,
                icon, // Aseguramos que el icon pase intacto
                label: hasBadge ? (
                    <div className={`flex items-center gap-1.5 ${showRedAlert ? '!text-red-500 alert-icon-trigger' : ''}`}>
                        {/* Inyectamos CSS con :has() para teñir de rojo el Icon hermano en el UI Kit sin modificar el componente GlassViewToggle */}
                        {showRedAlert && (
                            <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                        )}
                        <span>{label}</span>
                        <span className={`relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none ${hasCritical ? 'bg-red-100 !text-red-600 animate-pulse' : 'bg-amber-100 !text-amber-600'}`}>
                            {unassignedCount > 99 ? '99+' : unassignedCount}
                        </span>
                    </div>
                ) : (
                    <span className={showRedAlert ? '!text-red-500 font-bold alert-icon-trigger' : ''}>
                        {showRedAlert && (
                            <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                        )}
                        {label}
                    </span>
                )
            };
        });

        return {
            moduleInfo: {
                title: config?.name || 'Gestión de Tareas',
                description: 'Administra, supervisa y resuelve las actividades de mantenimiento.'
            },
            menuOptions: filteredOptions
        };
    }, [userRole, unassignedCount, hasCritical, location.pathname]);

    const activePath = menuOptions.find(opt => location.pathname === opt.id)?.id || (menuOptions[0]?.id || '/tickets/hoy');

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    {moduleInfo.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    {moduleInfo.description}
                </p>
            </div>

            {menuOptions.length > 0 && (
                <div className="sticky top-0 z-30 mb-3 py-1 flex items-center justify-center transition-all">
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

            <div className="flex-1 w-full">
                {children}
            </div>
        </>
    );
}