// src/features/hoy/components/common/hoy-review-modal.jsx
import React from 'react';
import { TicketReviewModal as TicketsReview } from '@/features/tickets/components/historico/ticket-review-modal';
import { TicketReviewModal as MantenimientosReview } from '@/features/mantenimientos/components/historico/ticket-review-modal';

export const HoyReviewModal = (props) => {
    const isMaintenance = props.ticket?.maquinaId !== undefined && props.ticket?.maquinaId !== null;
    const ActiveReviewModal = isMaintenance ? MantenimientosReview : TicketsReview;
    return <ActiveReviewModal {...props} />;
};
