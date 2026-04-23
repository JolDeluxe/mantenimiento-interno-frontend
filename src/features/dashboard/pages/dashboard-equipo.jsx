import { useState, useEffect, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import { useEquipo } from '../hooks/use-equipo';
import DashboardEquipoDesktop from '../views/dashboard-equipo-desktop';
import DashboardEquipoMobile from '../views/dashboard-equipo-mobile';

export default function DashboardEquipo() {
    const isDesktop = useIsDesktop();
    const { filtro } = useDashboardContext();
    const { data, loading, error, fetchEquipo } = useEquipo();
    const [detalleTarget, setDetalleTarget] = useState(null);

    const refreshData = useCallback(() => {
        const params = {};
        if (filtro.fechaInicio && filtro.fechaFin) {
            params.fechaInicio = filtro.fechaInicio;
            params.fechaFin = filtro.fechaFin;
        } else {
            if (filtro.year) params.year = filtro.year;
            if (filtro.month) params.month = filtro.month;
        }
        fetchEquipo(params);
    }, [filtro, fetchEquipo]);

    useEffect(() => { refreshData(); }, [refreshData]);

    const viewProps = {
        loading, error, filtro,
        tecnicos: data?.tecnicos ?? [],
        coordinadores: data?.coordinadores ?? [],
        promedioGlobal: data?.promedioEquipoGlobal,
        detalleTarget,
        onViewDetail: setDetalleTarget,
        onCloseDetail: () => setDetalleTarget(null),
        onRefresh: refreshData
    };

    return isDesktop ? <DashboardEquipoDesktop {...viewProps} /> : <DashboardEquipoMobile {...viewProps} />;
}