import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useGeneral } from '../hooks/use-general';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardGeneralDesktop from '../views/dashboard-general-desktop';
import DashboardGeneralMobile from '../views/dashboard-general-mobile';

export default function DashboardGeneral() {
    const isDesktop = useIsDesktop();

    // 1. Extraemos el filtro del contexto (Fechas, año, mes)
    const { filtro } = useDashboardContext();

    // 2. El Hook obtiene el JSON exacto de nuestro Fat Backend
    const { data, loading, error } = useGeneral(filtro);

    if (error) {
        return <div className="p-4 text-red-500 font-bold bg-red-50 rounded-xl m-4">Error: {error}</div>;
    }

    // 3. Pasamos ÚNICAMENTE `data` y `loading`. 
    // Las vistas Desktop y Mobile ya están programadas para extraer `resumen`, `tipos`, etc., desde `data`.
    return isDesktop
        ? <DashboardGeneralDesktop data={data} loading={loading} />
        : <DashboardGeneralMobile data={data} loading={loading} />;
}