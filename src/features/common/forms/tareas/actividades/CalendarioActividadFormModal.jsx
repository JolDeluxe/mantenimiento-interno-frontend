import { ActividadFormModal } from './ActividadFormModal';
import { calendarioActividadesRules } from './calendario-actividades-rules';

export const CalendarioActividadFormModal = (props) => (
    <ActividadFormModal
        {...props}
        defaultModoLista={props.defaultModoLista ?? false}
        rules={calendarioActividadesRules}
    />
);
