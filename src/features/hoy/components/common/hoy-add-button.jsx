// src/features/hoy/components/common/hoy-add-button.jsx
import React from 'react';
import { TicketAddButton as TicketsAdd } from '@/features/tickets/components/historico/ticket-add-button';
import { TicketAddButton as MantenimientosAdd } from '@/features/mantenimientos/components/historico/ticket-add-button';

export const HoyAddButton = ({ scope = 'general', ...props }) => {
    const ActiveAddButton = scope === 'mantenimientos' ? MantenimientosAdd : TicketsAdd;
    return <ActiveAddButton {...props} />;
};
