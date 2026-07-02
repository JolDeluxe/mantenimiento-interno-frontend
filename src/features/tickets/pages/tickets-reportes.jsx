// src/features/tickets/pages/tickets-reportes.jsx
import TicketsListadoBase from '../components/common/tickets-listado-base';

const REPORTES_DEFAULT_FILTERS = { tipo: 'TICKET' };

export default function TicketsReportesPage() {
    return (
        <TicketsListadoBase
            mode="reportes"
            scope="actividades"
            allowCreate={false}
            defaultFilters={REPORTES_DEFAULT_FILTERS}
        />
    );
}
