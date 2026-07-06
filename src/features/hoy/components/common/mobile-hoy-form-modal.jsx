// src/features/hoy/components/common/mobile-hoy-form-modal.jsx
import { HoyActividadesForm } from '../hoy-actividades/hoy-actividades-form';
import { MobileMantenimientosFormModal } from '@/features/mantenimientos/components/common/mobile-mantenimientos-form-modal';

export const MobileHoyFormModal = (props) => {
    const { scope, ticketAEditar } = props;
    
    const esMantenimiento = ticketAEditar 
        ? (ticketAEditar.clasificacion === 'PREVENTIVO' || ticketAEditar.clasificacion === 'CORRECTIVO')
        : (scope === 'mantenimientos');

    if (esMantenimiento) {
        return <MobileMantenimientosFormModal {...props} scope={scope || "mantenimientos"} />;
    }
    return <HoyActividadesForm {...props} isMobile={true} />;
};
