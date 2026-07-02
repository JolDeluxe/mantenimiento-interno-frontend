// src/features/mantenimientos/views/mantenimientos-layout-mobile.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';
import { useAuthStore } from '@/stores/auth-store';

export default function MantenimientosLayoutMobile() {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const userRole = currentUser?.rol;

    const { moduleInfo, menuOptions } = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'mantenimientos');
        const baseMenuOptions = [
            { configId: 'mantenimientos-correctivos', id: '/mantenimientos/correctivos', label: 'Correctivos', icon: 'build' },
            { configId: 'mantenimientos-preventivos', id: '/mantenimientos/preventivos', label: 'Preventivos', icon: 'event_note' },
            { configId: 'mantenimientos-historico', id: '/mantenimientos/historico', label: 'Historial', icon: 'history' }
        ];
 
        const filteredOptions = baseMenuOptions
            .filter(opt => {
                const childConfig = config?.children?.find(c => c.id === opt.configId);
                return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
            })
            .map(({ label, icon, ...rest }) => ({ ...rest, icon, label }));

        return {
            moduleInfo: {
                title: config?.name || 'Gestión de Mantenimientos',
                description: 'Administra preventivos, correctivos y KPIs de maquinaria.'
            },
            menuOptions: filteredOptions
        };
    }, [userRole]);

    const activePath = menuOptions.find(opt => location.pathname.includes(opt.id))?.id
        || menuOptions[0]?.id
        || '/mantenimientos/historico';

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
