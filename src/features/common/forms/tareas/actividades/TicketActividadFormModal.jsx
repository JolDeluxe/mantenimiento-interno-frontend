import { ActividadFormModal } from './ActividadFormModal';
import { ticketsActividadesRules } from './tickets-actividades-rules';

export const TicketActividadFormModal = (props) => (
    <ActividadFormModal
        {...props}
        rules={ticketsActividadesRules}
    />
);
