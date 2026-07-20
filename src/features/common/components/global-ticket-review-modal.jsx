import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { TicketReviewModal as DesktopModal } from '@/features/tickets/components/historico/ticket-review-modal';
import { MobileTicketReviewModal as MobileModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';

/**
 * Componente unificado y adaptativo para revisar tickets resueltos.
 * Retorna la versin de escritorio o mvil dependiendo del dispositivo.
 */
export const GlobalTicketReviewModal = (props) => {
    const isDesktop = useIsDesktop();
    
    if (isDesktop) {
        return <DesktopModal {...props} />;
    }
    
    return <MobileModal {...props} />;
};
