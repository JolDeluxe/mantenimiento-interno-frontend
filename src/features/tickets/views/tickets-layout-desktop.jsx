// src/features/tickets/views/tickets-layout-desktop.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';

export default function TicketsLayoutDesktop({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menu = [
        { id: 'hoy', label: 'Tareas de Hoy', path: '/tickets/hoy', icon: 'today' },
        { id: 'bandeja', label: 'Bandeja de Entrada', path: '/tickets/bandeja', icon: 'inbox' },
        { id: 'historico', label: 'Historial', path: '/tickets/historico', icon: 'assignment_globe' }
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-3 sticky top-0 max-h-full h-full p-2 bg-cuadra-arena border-b border-slate-300/60 pb-2 mb-2 px-1 z-30 transition-all">
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

            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}