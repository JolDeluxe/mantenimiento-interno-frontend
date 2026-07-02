// src/features/tickets/views/tickets-reportes-desktop.jsx
import { TicketsActividadesDesktop } from './tickets-actividades-desktop';

export const TicketsReportesDesktop = (props) => (
    <TicketsActividadesDesktop {...props} mode="reportes" allowCreate={false} />
);
