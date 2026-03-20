import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { MODULES_CONFIG } from '@/config/modules-config';

export default function TicketsLayoutMobile({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const moduleInfo = useMemo(() => {
        const config = MODULES_CONFIG.find(m => m.id === 'tickets');
        return {
            title: config?.name || 'Gestión de Tareas',
            description: 'Administra, supervisa y resuelve las actividades de mantenimiento.'
        };
    }, []);

    const menuOptions = [
        { id: '/tickets/hoy', label: 'Mi Día', icon: 'today' },
        { id: '/tickets/bandeja', label: 'Bandeja', icon: 'inbox' },
        { id: '/tickets/historico', label: 'Historial', icon: 'history' }
    ];

    const activePath = menuOptions.find(opt => location.pathname === opt.id)?.id || '/tickets/hoy';

    return (
        <>
            {/* ── 1. ENCABEZADO ── */}
            <div className="px-1 mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight fuente-titulos uppercase">
                    {moduleInfo.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-snug">
                    {moduleInfo.description}
                </p>
            </div>

            {/* ── 2. CONTROLES STICKY TRANSPARENTES ── */}
            {/* Eliminados -mx-6 y px-6. Ahora respeta los límites del padre sin generar overflow horizontal */}
            <div className="sticky top-0 z-30 mb-3 py-2 flex items-center justify-center transition-all">
                <div className="overflow-x-auto no-scrollbar w-full flex justify-center">
                    <GlassViewToggle
                        options={menuOptions}
                        value={activePath}
                        onChange={(newPath) => navigate(newPath)}
                        activeVariant="primary"
                    />
                </div>
            </div>

            {/* ── 3. CONTENIDO (Vistas Hijas) ── */}
            <div className="flex-1 w-full">
                {children}
            </div>
        </>
    );
}