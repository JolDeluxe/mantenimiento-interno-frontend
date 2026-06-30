// src/features/hoy/views/hoy-layout-mobile.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';

export default function HoyLayoutMobile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const menuOptions = useMemo(() => {
        const hoyModule = MODULES_CONFIG.find(m => m.id === 'hoy');
        const baseMenu = [
            { id: '/hoy/todas', label: 'Todas', icon: 'list_alt' },
            { id: '/hoy/actividades', label: 'Actividades', icon: 'engineering' },
            { id: '/hoy/mantenimientos', label: 'Mantenimientos', icon: 'precision_manufacturing' },
        ];

        return baseMenu.filter(item => {
            const childConfig = hoyModule?.children?.find(c => c.route === item.id);
            return childConfig ? childConfig.allowedRoles.includes(currentUser?.rol) : false;
        });
    }, [currentUser?.rol]);

    const activePath = menuOptions.find(opt => location.pathname.includes(opt.id))?.id 
                       || menuOptions[0]?.id;

    if (menuOptions.length === 0) return null;

    return (
        <div className="sticky top-0 z-40 mb-4 py-1 flex items-center justify-center transition-all bg-transparent">
            <div className="overflow-x-auto no-scrollbar w-full flex justify-center px-1">
                <GlassViewToggle
                    options={menuOptions.map(opt => ({
                        id: opt.id,
                        icon: opt.icon,
                        // AQUÍ ESTÁ LA LÓGICA: 
                        // Solo mostramos el label si el id coincide con el activo
                        label: opt.id === activePath ? opt.label : null 
                    }))}
                    value={activePath}
                    onChange={(newPath) => navigate(newPath)}
                    activeVariant="primary"
                />
            </div>
        </div>
    );
}