// src/features/hoy/views/hoy-layout-mobile.jsx
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';
import { cn } from '@/utils/cn';

export default function HoyLayoutMobile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const currentUser = user?.data || user;

    const menu = useMemo(() => {
        const hoyModule = MODULES_CONFIG.find(m => m.id === 'hoy');
        const baseMenu = [
            { id: 'hoy-todas', label: 'Todas', path: '/hoy/todas', icon: 'list_alt' },
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
        <div className="flex bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-1 gap-1 shadow-sm w-full mb-3 select-none">
            {menu.map(item => {
                const isActive = location.pathname.includes(item.path);

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className={cn(
                            'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
                            isActive
                                ? 'bg-marca-secundario text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        )}
                    >
                        <Icon name={item.icon} size="sm" />
                        <span className="truncate">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
