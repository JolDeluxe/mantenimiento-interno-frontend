import React from 'react';
import { TicketDetailModal } from '../historico/ticket-detail-modal';

export function BandejaDetailModal(props) {
    // Actúa como un puente transparente hacia el componente maestro
    return (
        <TicketDetailModal {...props} />
    );
}