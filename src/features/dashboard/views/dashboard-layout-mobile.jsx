import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardFechas } from '../components/dashboard-fechas';

export default function DashboardLayoutMobile({ children, contextData }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const userRole = user?.data?.rol || user?.rol;

    const { menuOptions } = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'reportes');
        const baseMenuOptions = [
            { configId: 'reportes-general', id: '/reportes/general', label: 'General', icon: 'dashboard' },
            { configId: 'reportes-equipo', id: '/reportes/equipo', label: 'Equipo', icon: 'groups' },
            { configId: 'reportes-area', id: '/reportes/area', label: 'Área', icon: 'domain' },
            { configId: 'reportes-cliente', id: '/reportes/cliente', label: 'Cliente', icon: 'domain' }
        ];

        const filteredOptions = baseMenuOptions.filter(opt => {
            const childConfig = config?.children?.find(c => c.id === opt.configId);
            return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
        });

        return { menuOptions: filteredOptions };
    }, [userRole]);

    const activePath = menuOptions.find(opt => location.pathname.includes(opt.id))?.id || menuOptions[0]?.id;

    return (
        <>
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    Reportes y KPIs
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    Rendimiento operacional y métricas.
                </p>
            </div>

            <div className="mb-4">
                <DashboardFechas
                    year={contextData.filtro.year}
                    month={contextData.filtro.month}
                    aniosDisponibles={contextData.data?.aniosDisponibles ?? []}
                    onChange={contextData.onFiltroChange}
                />
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

            <div className="flex-1 w-full pb-24">
                {children}
            </div>
        </>
    );
}