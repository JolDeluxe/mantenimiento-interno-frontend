// src/features/tickets/views/tickets-reportes-mobile.jsx
import { TicketsActividadesMobile } from './tickets-actividades-mobile';

export const TicketsReportesMobile = (props) => (
    <TicketsActividadesMobile {...props} mode="reportes" allowCreate={false} />
);
