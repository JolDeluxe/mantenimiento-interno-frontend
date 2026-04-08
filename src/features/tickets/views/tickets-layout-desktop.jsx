// src/features/tickets/views/tickets-layout-desktop.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { MODULES_CONFIG } from '@/config/modules-config';
import { getTickets } from '../api/tickets-api';

// Función para replicar la evaluación de tiempo real
const calculateDaysWaiting = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const today = new Date();
    created.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

export default function TicketsLayoutDesktop({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuthStore();
    const currentUser = user?.data || user;
    const userRole = currentUser?.rol;

    const menu = useMemo(() => {
        const ticketsModule = MODULES_CONFIG.find(m => m.id === 'tickets');
        const baseMenu = [
            { id: 'tickets-hoy', label: 'Tareas de Hoy', path: '/tickets/hoy', icon: 'today' },
            { id: 'tickets-bandeja', label: 'Bandeja de Entrada', path: '/tickets/bandeja', icon: 'inbox' },
            { id: 'tickets-historico', label: 'Historial', path: '/tickets/historico', icon: 'assignment_globe' }
        ];

        return baseMenu.filter(item => {
            const childConfig = ticketsModule?.children?.find(c => c.id === item.id);
            return childConfig ? childConfig.allowedRoles.includes(userRole) : false;
        });
    }, [userRole]);

    const hasBandejaAccess = menu.some(m => m.id === 'tickets-bandeja');
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [hasCritical, setHasCritical] = useState(false);

    // Polling nativo (60 segundos) replicando la lógica exacta de evaluación de retrasos
    useEffect(() => {
        if (!hasBandejaAccess) return;

        let isMounted = true;
        const fetchCount = async () => {
            try {
                const response = await getTickets({ tipo: 'TICKET', estado: 'PENDIENTE' });

                if (isMounted) {
                    const rawData = response?.data?.data || response?.data;
                    const ticketsData = Array.isArray(rawData) ? rawData : [];

                    const unassigned = ticketsData.filter(t => !t.responsables || t.responsables.length === 0);

                    // Determinamos si hay algún ticket con 3 o más días en espera
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
    }, [hasBandejaAccess]);

    return (
        <div className="flex flex-col gap-4">
            {menu.length > 0 && (
                <div className="flex gap-3 sticky top-0 max-h-full h-full p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 transition-all">
                    {menu.map(item => {
                        const isActive = location.pathname.includes(item.path);
                        const isBandeja = item.id === 'tickets-bandeja';
                        const showRedAlert = isBandeja && hasCritical && !isActive;

                        let btnClasses = isActive ? 'shadow-md' : 'bg-white';
                        if (showRedAlert) {
                            btnClasses = '!bg-red-50 !text-red-600 hover:!bg-red-100 hover:!text-red-700 border border-red-200 shadow-sm';
                        }

                        return (
                            <div key={item.id} className="relative">
                                <Button
                                    size="sm"
                                    variant={isActive ? 'primario' : 'ghost'}
                                    icon={item.icon}
                                    iconSize="md"
                                    onClick={() => navigate(item.path)}
                                    className={btnClasses}
                                >
                                    {item.label}
                                </Button>

                                {isBandeja && unassignedCount > 0 && (
                                    <span className={`absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none ${hasCritical ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}`}>
                                        {unassignedCount > 99 ? '99+' : unassignedCount}
                                    </span>
                                )}
                            </div>
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