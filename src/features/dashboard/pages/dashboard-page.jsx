import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useMetricas } from '../hooks/use-area';
import { getMinDateHoy } from '@/lib/date';
import { DashboardContext } from '../context/dashboard-context';
import DashboardLayoutDesktop from '../views/dashboard-layout-desktop';
import DashboardLayoutMobile from '../views/dashboard-layout-mobile';

const getCurrentYear = () => Number(getMinDateHoy().split('-')[0]);
const getCurrentMonth = () => Number(getMinDateHoy().split('-')[1]);

export default function DashboardPage() {
    const isDesktop = useIsDesktop();
    const { data, loading, fetchMetricas } = useMetricas();

    const [filtro, setFiltro] = useState({
        year: getCurrentYear(),
        month: getCurrentMonth(),
        fechaInicio: null,
        fechaFin: null,
    });

    const load = useCallback(() => {
        const params = {};
        if (filtro.fechaInicio && filtro.fechaFin) {
            params.fechaInicio = filtro.fechaInicio;
            params.fechaFin = filtro.fechaFin;
        } else {
            if (filtro.year) params.year = filtro.year;
            if (filtro.month) params.month = filtro.month;
        }
        fetchMetricas(params);
    }, [filtro, fetchMetricas]);

    useEffect(() => { load(); }, [load]);

    const handleFiltroChange = useCallback(({ year, month, fechaInicio, fechaFin }) => {
        setFiltro({
            year: year ?? null,
            month: month ?? 0,
            fechaInicio: fechaInicio ?? null,
            fechaFin: fechaFin ?? null,
        });
    }, []);

    // 🚨 PASAMOS "load" COMO "onRefresh" PARA TODO EL ECOSISTEMA
    const contextData = { data, loading, filtro, onFiltroChange: handleFiltroChange, onRefresh: load };

    return (
        <DashboardContext.Provider value={contextData}>
            <div className="max-w-full mx-auto">
                <div className="p-1 lg:p-4">
                    {isDesktop ? (
                        <DashboardLayoutDesktop contextData={contextData}>
                            <Outlet />
                        </DashboardLayoutDesktop>
                    ) : (
                        <DashboardLayoutMobile contextData={contextData}>
                            <Outlet />
                        </DashboardLayoutMobile>
                    )}
                </div>
            </div>
        </DashboardContext.Provider>
    );
}