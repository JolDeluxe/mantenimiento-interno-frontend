import React from 'react';
import { TableActions } from '@/components/ui/z_index';

export const TicketActions = ({ ticket, userRole, onAssign, onStatusChange, onViewDetails }) => {
    const actions = [];

    actions.push({
        label: 'Ver Detalles',
        icon: 'visibility',
        onClick: () => onViewDetails(ticket)
    });

    if (['COORDINADOR_MTTO', 'JEFE_MTTO', 'SUPER_ADMIN'].includes(userRole)) {
        actions.push({
            label: 'Asignar Técnico',
            icon: 'person_add',
            onClick: () => onAssign(ticket)
        });
    }

    actions.push({
        label: 'Cambiar Estado',
        icon: 'swap_horiz',
        onClick: () => onStatusChange(ticket)
    });

    return <TableActions actions={actions} />;
};