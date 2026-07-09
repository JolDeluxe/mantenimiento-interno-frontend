import { ActividadFormModal, hoyActividadesRules } from '@/features/common/forms/tareas/actividades';

export const HoyActividadesForm = (props) => (
    <ActividadFormModal
        {...props}
        rules={hoyActividadesRules}
    />
);
