// src/features/dashboard/pages/dashboard-general.jsx
import React, { useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardGeneralDesktop from '../views/dashboard-general-desktop';
import DashboardGeneralMobile from '../views/dashboard-general-mobile';

export default function DashboardGeneral() {
    const isDesktop = useIsDesktop();
    const { data, loading } = useDashboardContext();

    const generalData = data?.general;
    const resumen = generalData?.resumen;
    const distribuciones = generalData?.distribuciones ?? {};
    const backlog = generalData?.backlog ?? { totalActivo: 0, desglose: {} };

    const topCategorias = useMemo(() => {
        if (!distribuciones.categorias) return [];
        return Object.entries(distribuciones.categorias)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [distribuciones.categorias]);

    const colorEficiencia = resumen?.eficienciaEstimacionGlobal
        ? (resumen.eficienciaEstimacionGlobal <= 100 ? 'green' : resumen.eficienciaEstimacionGlobal <= 120 ? 'amber' : 'red')
        : 'neutral';

    const viewProps = { loading, resumen, distribuciones, backlog, topCategorias, colorEficiencia };

    return isDesktop ? <DashboardGeneralDesktop {...viewProps} /> : <DashboardGeneralMobile {...viewProps} />;
}