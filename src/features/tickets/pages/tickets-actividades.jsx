// src/features/tickets/pages/tickets-actividades.jsx
import TicketsListadoBase from '../components/common/tickets-listado-base';

const ACTIVIDADES_DEFAULT_FILTERS = { tipoIn: ['PLANEADA', 'EXTRAORDINARIA'] };

export default function TicketsActividadesPage() {
    return (
        <TicketsListadoBase
            mode="actividades"
            scope="actividades"
            allowCreate
            defaultFilters={ACTIVIDADES_DEFAULT_FILTERS}
        />
    );
}
