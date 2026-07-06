// src/features/hoy/components/common/hoy-form-modal.jsx
import { HoyActividadesForm } from '../hoy-actividades/hoy-actividades-form';
import { MantenimientosFormModal } from '@/features/mantenimientos/components/common/mantenimientos-form-modal';

export const HoyFormModal = (props) => {
    const { scope, ticketAEditar } = props;
    
    const esMantenimiento = ticketAEditar 
        ? (ticketAEditar.clasificacion === 'PREVENTIVO' || ticketAEditar.clasificacion === 'CORRECTIVO')
        : (scope === 'mantenimientos');

    if (esMantenimiento) {
        return <MantenimientosFormModal {...props} scope={scope || "mantenimientos"} />;
    }
    return <HoyActividadesForm {...props} isMobile={false} />;
};
