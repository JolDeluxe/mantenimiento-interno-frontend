// src/features/tickets/pages/tickets-historico.jsx
import TicketsListadoBase from '../components/common/tickets-listado-base';

export default function TicketsHistoricoPage() {
    return (
        <TicketsListadoBase
            mode="historico"
            scope="actividades"
            allowCreate
        />
    );
}
