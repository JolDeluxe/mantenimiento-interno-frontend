import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardReportesDesktop from '../views/dashboard-reportes-desktop';
import DashboardReportesMobile from '../views/dashboard-reportes-mobile';

export default function DashboardReportes() {
    const isDesktop = useIsDesktop();
    const { loading, onRefresh } = useDashboardContext();

    const viewProps = { loading, onRefresh };

    return isDesktop ? <DashboardReportesDesktop {...viewProps} /> : <DashboardReportesMobile {...viewProps} />;
}