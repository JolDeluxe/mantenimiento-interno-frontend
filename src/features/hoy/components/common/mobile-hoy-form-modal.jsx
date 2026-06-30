// src/features/hoy/components/common/mobile-hoy-form-modal.jsx
import { HoyActividadesForm } from '../hoy-actividades/hoy-actividades-form';
import { HoyMantenimientosForm } from '../hoy-mantenimientos/hoy-mantenimientos-form';

export const MobileHoyFormModal = (props) => {
    const { scope, ticketAEditar } = props;
    
    const esMantenimiento = ticketAEditar 
        ? (ticketAEditar.clasificacion === 'PREVENTIVO' || ticketAEditar.clasificacion === 'CORRECTIVO')
        : (scope === 'mantenimientos');

    if (esMantenimiento) {
        return <HoyMantenimientosForm {...props} isMobile={true} />;
    }
    return <HoyActividadesForm {...props} isMobile={true} />;
};
