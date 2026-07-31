// src/features/tickets/pages/tickets-actividades.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import TicketsListadoBase from '../components/common/tickets-listado-base';

const ACTIVIDADES_DEFAULT_FILTERS = { tipoIn: ['PLANEADA', 'EXTRAORDINARIA'] };

export default function TicketsActividadesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useAuthStore((state) => state.user?.data ?? state.user);
    const canManage = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'].includes(currentUser?.rol);
    const requested = searchParams.get('tab');
    const tab = requested === 'recurrentes' && canManage ? 'recurrentes' : 'actividades';

    useEffect(() => {
        if (!requested || requested === tab) return;
        const next = new URLSearchParams(searchParams);
        next.set('tab', tab);
        setSearchParams(next, { replace: true });
    }, [requested, searchParams, setSearchParams, tab]);

    const changeTab = (nextTab) => {
        const next = new URLSearchParams(searchParams);
        next.set('tab', nextTab);
        setSearchParams(next);
    };

    return (
        <TicketsListadoBase
            mode="actividades"
            scope="actividades"
            allowCreate
            defaultFilters={ACTIVIDADES_DEFAULT_FILTERS}
            actividadTab={tab}
            canManageRecurrentes={canManage}
            onActividadTabChange={changeTab}
            onActividadRecurrenteMaterialized={() => window.dispatchEvent(new Event('cuadra-sync-complete'))}
        />
    );
}
