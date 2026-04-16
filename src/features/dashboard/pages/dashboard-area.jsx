import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardAreaDesktop from '../views/dashboard-area-desktop';
import DashboardAreaMobile from '../views/dashboard-area-mobile';

export default function DashboardArea() {
    const isDesktop = useIsDesktop();
    const { data, loading } = useDashboardContext();

    const metricasPorPlanta = data?.metricasPorPlanta || [];

    const [plantaDetalle, setPlantaDetalle] = useState(null);
    const [areaDetalle, setAreaDetalle] = useState(null);

    const viewProps = {
        loading,
        metricasPorPlanta,
        plantaDetalle,
        areaDetalle,
        onOpenPlanta: setPlantaDetalle,
        onOpenArea: (a, pName) => setAreaDetalle({ ...a, plantaName: pName }),
        onClosePlanta: () => setPlantaDetalle(null),
        onCloseArea: () => setAreaDetalle(null)
    };

    return isDesktop ? <DashboardAreaDesktop {...viewProps} /> : <DashboardAreaMobile {...viewProps} />;
}