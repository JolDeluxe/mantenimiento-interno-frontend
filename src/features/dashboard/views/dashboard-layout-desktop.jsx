// src/features/dashboard/views/dashboard-layout-desktop.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';
import { DashboardFechas } from '../components/dashboard-fechas';

export default function DashboardLayoutDesktop({ children, contextData }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const userRole = user?.data?.rol || user?.rol;

    const menu = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'reportes');
        const baseMenu = [
            { id: 'reportes-general', label: 'Visión General', path: '/reportes/general', icon: 'dashboard' },
            { id: 'reportes-equipo', label: 'Rendimiento de Equipo', path: '/reportes/equipo', icon: 'groups' },
            { id: 'reportes-area', label: 'Métricas por Área', path: '/reportes/area', icon: 'domain' },
            { id: 'reportes-cliente', label: 'Métricas de Reportes', path: '/reportes/cliente', icon: 'domain' }
        ];

        return baseMenu.filter(item => {
            const childConfig = config?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
        });
    }, [userRole]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                    <div className="w-full m-5 xl:w-auto shrink-0">
                        <DashboardFechas
                            year={contextData.filtro.year}
                            month={contextData.filtro.month}
                            aniosDisponibles={contextData.data?.aniosDisponibles ?? []}
                            onChange={contextData.onFiltroChange}
                        />
                    </div>
                </div>
            </div>

            {menu.length > 0 && (
                <div className="flex gap-3 sticky top-0 p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 w-full">
                    {menu.map(item => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Button
                                key={item.id}
                                size="sm"
                                variant={isActive ? 'primario' : 'ghost'}
                                icon={item.icon}
                                iconSize="md"
                                onClick={() => navigate(item.path)}
                                className={isActive ? 'shadow-md' : 'bg-white'}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </div>
            )}

            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}