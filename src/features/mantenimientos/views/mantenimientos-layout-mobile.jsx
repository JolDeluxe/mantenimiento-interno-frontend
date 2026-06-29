// src/features/mantenimientos/views/mantenimientos-layout-mobile.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { getMantenimientos } from '../api/mantenimientos-api';

export default function MantenimientosLayoutMobile() {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const userRole = currentUser?.rol;

    const canAccessBandeja = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'mantenimientos');
        const childConfig = config?.children?.find(c => c.id === 'mantenimientos-bandeja');
        return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
    }, [userRole]);

    const [unassignedCount, setUnassignedCount] = useState(0);
    const [hasCritical, setHasCritical] = useState(false);

    useEffect(() => {
        if (!canAccessBandeja) return;
        let isMounted = true;

        const fetchCount = async () => {
            try {
                const response = await getMantenimientos({ tipo: 'TICKET', estado: 'PENDIENTE' });
                if (isMounted) {
                    const rawData = response?.data?.data || response?.data;
                    const ticketsData = Array.isArray(rawData) ? rawData : [];
                    const unassigned = ticketsData.filter(t => !t.responsables || t.responsables.length === 0);
                    const isCritical = unassigned.some(t => t.diasEnEspera >= 3);
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
        const config = MODULES_CONFIG.find(m => m.id === 'mantenimientos');
        const baseMenuOptions = [
            // { configId: 'hoy-mantenimientos', id: '/hoy/mantenimientos', label: 'Mi Día', icon: 'today' },
            { configId: 'mantenimientos-aprobar', id: '/mantenimientos/aprobar', label: 'Por Aprobar', icon: 'check' },
            { configId: 'mantenimientos-bandeja', id: '/mantenimientos/bandeja', label: 'Bandeja', icon: 'inbox' },
            { configId: 'mantenimientos-correctivos', id: '/mantenimientos/correctivos', label: 'Correctivos', icon: 'build' },
            { configId: 'mantenimientos-preventivos', id: '/mantenimientos/preventivos', label: 'Preventivos', icon: 'event_note' },
            { configId: 'mantenimientos-historico', id: '/mantenimientos/historico', label: 'Historial', icon: 'history' }
        ];
 
        const filteredOptions = baseMenuOptions
            .filter(opt => {
                if (opt.configId === 'hoy-mantenimientos') {
                    const hoyConfig = MODULES_CONFIG.find(m => m.id === 'hoy');
                    const childConfig = hoyConfig?.children?.find(c => c.id === 'hoy-mantenimientos');
                    return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
                }
                const childConfig = config?.children?.find(c => c.id === opt.configId);
                return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
            })
            .map(({ configId, label, icon, ...rest }) => {
                const isBandeja = configId === 'mantenimientos-bandeja';
                const hasBadge = isBandeja && unassignedCount > 0;
                const isActive = location.pathname.includes(rest.id);
                const showRedAlert = isBandeja && hasCritical && !isActive;

                return {
                    ...rest,
                    icon,
                    label: hasBadge ? (
                        <div className={`flex items-center gap-1.5 ${showRedAlert ? '!text-red-500 alert-icon-trigger' : ''}`}>
                            {showRedAlert && (
                                <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                            )}
                            {isActive && <span>{label}</span>}
                            <span className={`relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none border ${hasCritical ? 'bg-red-100 !text-red-600 border-red-200 animate-pulse' : 'bg-amber-100 !text-amber-700 border-amber-200'}`}>
                                {unassignedCount > 99 ? '99+' : unassignedCount}
                            </span>
                        </div>
                    ) : (
                        isActive ? (
                            <span className={showRedAlert ? '!text-red-500 font-bold alert-icon-trigger' : ''}>
                                {showRedAlert && (
                                    <style>{`button:has(.alert-icon-trigger) .material-symbols-rounded { color: #ef4444 !important; transition: color 0.2s; }`}</style>
                                )}
                                {label}
                            </span>
                        ) : null
                    )
                };
            });

        return {
            moduleInfo: {
                title: config?.name || 'Gestión de Mantenimientos',
                description: 'Administra preventivos, correctivos y KPIs de maquinaria.'
            },
            menuOptions: filteredOptions
        };
    }, [userRole, unassignedCount, hasCritical, location.pathname]);

    const activePath = menuOptions.find(opt => location.pathname.includes(opt.id))?.id
        || menuOptions[0]?.id
        || '/mantenimientos/hoy';

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
                <div className="sticky top-0 z-40 mb-3 py-1 flex items-center justify-center transition-all bg-transparent">
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
        </>
    );
}
