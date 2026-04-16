// src/features/dashboard/pages/dashboard-reportes.jsx
import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import DashboardReportesDesktop from '../views/dashboard-reportes-desktop';
import DashboardReportesMobile from '../views/dashboard-reportes-mobile';

export default function DashboardReportes() {
    const isDesktop = useIsDesktop();

    return isDesktop ? <DashboardReportesDesktop /> : <DashboardReportesMobile />;
}