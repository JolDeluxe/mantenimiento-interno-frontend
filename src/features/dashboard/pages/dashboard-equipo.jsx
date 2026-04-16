// src/features/dashboard/pages/dashboard-equipo.jsx
import React, { useState, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardEquipoDesktop from '../views/dashboard-equipo-desktop';
import DashboardEquipoMobile from '../views/dashboard-equipo-mobile';

export default function DashboardEquipo() {
    const isDesktop = useIsDesktop();
    const { data, loading, filtro } = useDashboardContext();
    const tecnicos = data?.kpiPorTecnico ?? [];

    const [detalleTarget, setDetalleTarget] = useState(null);

    const handleViewDetail = useCallback((tecnico) => {
        setDetalleTarget(tecnico);
    }, []);

    const operativos = tecnicos.filter((t) => t.rol === 'TECNICO');
    const coordinadores = tecnicos.filter((t) => t.rol === 'COORDINADOR_MTTO' || t.rol === 'JEFE_MTTO');
    const sinRol = tecnicos.filter((t) => !['TECNICO', 'COORDINADOR_MTTO', 'JEFE_MTTO'].includes(t.rol));

    const viewProps = {
        loading,
        tecnicos,
        operativos,
        coordinadores,
        sinRol,
        filtro,
        detalleTarget,
        onViewDetail: handleViewDetail,
        onCloseDetail: () => setDetalleTarget(null)
    };

    return isDesktop ? <DashboardEquipoDesktop {...viewProps} /> : <DashboardEquipoMobile {...viewProps} />;
}