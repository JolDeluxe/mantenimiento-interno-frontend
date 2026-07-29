import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardAreaDesktop from '../views/dashboard-area-desktop';
import DashboardAreaMobile from '../views/dashboard-area-mobile';

const sumObjectValues = (target = {}, source = {}) => {
    Object.entries(source || {}).forEach(([key, value]) => {
        target[key] = (target[key] || 0) + (Number(value) || 0);
    });
    return target;
};

const buildMetricasPorArea = (groups = []) => {
    const byArea = new Map();

    groups.forEach((group) => {
        (group?.areas || []).forEach((item) => {
            const areaName = item?.area;
            if (!areaName) return;

            const current = byArea.get(areaName) || {
                area: areaName,
                totalTareas: 0,
                tareasActivas: 0,
                tiposTotales: {},
                tiempos: {
                    tiempoRealTotal: 0,
                    tiempoEstimadoTotal: 0,
                    alertaTiempo: false,
                },
                estados: {},
                clasificaciones: {},
                frecuenciaTickets: [],
                items: [],
            };

            current.totalTareas += Number(item.totalTareas || 0);
            current.tareasActivas += Number(item.tareasActivas || 0);
            sumObjectValues(current.tiposTotales, item.tiposTotales);
            sumObjectValues(current.estados, item.estados);
            sumObjectValues(current.clasificaciones, item.clasificaciones);
            current.tiempos.tiempoRealTotal += Number(item.tiempos?.tiempoRealTotal || 0);
            current.tiempos.tiempoEstimadoTotal += Number(item.tiempos?.tiempoEstimadoTotal || 0);
            current.tiempos.alertaTiempo = current.tiempos.alertaTiempo || Boolean(item.tiempos?.alertaTiempo);
            current.frecuenciaGeneral = current.frecuenciaGeneral || item.frecuenciaGeneral;
            current.frecuenciaTickets.push(...(item.frecuenciaTickets || []));
            current.items.push(item);

            byArea.set(areaName, current);
        });
    });

    return [...byArea.values()].sort((a, b) => b.totalTareas - a.totalTareas);
};

export default function DashboardArea() {
    const isDesktop = useIsDesktop();
    const { data, loading, onRefresh } = useDashboardContext();

    const metricasPorArea = buildMetricasPorArea(data?.metricasPorPlanta || []);
    const [areaDetalle, setAreaDetalle] = useState(null);

    const viewProps = {
        loading,
        metricasPorArea,
        areaDetalle,
        onOpenArea: setAreaDetalle,
        onCloseArea: () => setAreaDetalle(null),
        onRefresh
    };

    return isDesktop ? <DashboardAreaDesktop {...viewProps} /> : <DashboardAreaMobile {...viewProps} />;
}
