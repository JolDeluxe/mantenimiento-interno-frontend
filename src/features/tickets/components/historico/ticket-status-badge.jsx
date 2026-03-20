import React from 'react';
import { Badge } from '@/components/ui/z_index';

export const TicketStatusBadge = ({ status }) => {
    const statusConfig = {
        PENDIENTE: { color: 'warning', label: 'Pendiente' },
        ASIGNADA: { color: 'info', label: 'Asignada' },
        EN_PROGRESO: { color: 'primary', label: 'En Progreso' },
        EN_PAUSA: { color: 'default', label: 'En Pausa' },
        RESUELTO: { color: 'success', label: 'Resuelto' },
        CERRADO: { color: 'default', label: 'Cerrado' },
        RECHAZADO: { color: 'danger', label: 'Rechazado' },
        CANCELADA: { color: 'danger', label: 'Cancelada' }
    };

    const config = statusConfig[status] || { color: 'default', label: status };
    return <Badge color={config.color}>{config.label}</Badge>;
};

export const TicketPriorityBadge = ({ priority }) => {
    const priorityConfig = {
        BAJA: { color: 'info', label: 'Baja' },
        MEDIA: { color: 'warning', label: 'Media' },
        ALTA: { color: 'danger', label: 'Alta' },
        CRITICA: { color: 'danger', label: 'Crítica' }
    };

    const config = priorityConfig[priority] || { color: 'default', label: priority };
    return <Badge color={config.color}>{config.label}</Badge>;
};