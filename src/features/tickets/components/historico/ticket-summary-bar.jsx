import React from 'react';
import { SummaryBar } from '@/components/ui/z_index';

export const TicketSummaryBar = ({ tickets = [] }) => {
    const stats = [
        {
            label: 'Pendientes',
            value: tickets.filter(t => t.estado === 'PENDIENTE').length
        },
        {
            label: 'En Progreso',
            value: tickets.filter(t => t.estado === 'EN_PROGRESO').length
        },
        {
            label: 'Críticos',
            value: tickets.filter(t => t.prioridad === 'CRITICA' && t.estado !== 'RESUELTO').length
        }
    ];

    return <SummaryBar title="Monitor de Tickets" stats={stats} />;
};