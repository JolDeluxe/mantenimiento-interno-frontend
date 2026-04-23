import React, { useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useGeneral } from '../hooks/use-general';
import { useDashboardContext } from '../context/dashboard-context';
import DashboardGeneralDesktop from '../views/dashboard-general-desktop';
import DashboardGeneralMobile from '../views/dashboard-general-mobile';

export default function DashboardGeneral() {
    const isDesktop = useIsDesktop();
    const { filtro } = useDashboardContext();
    const { data, loading, error, fetchGeneral } = useGeneral(filtro);

    const handleRefresh = useCallback(() => {
        fetchGeneral(filtro);
    }, [filtro, fetchGeneral]);

    if (error) {
        return <div className="p-4 text-red-500 font-bold bg-red-50 rounded-xl m-4">Error: {error}</div>;
    }

    const viewProps = { data, loading, onRefresh: handleRefresh };

    return isDesktop
        ? <DashboardGeneralDesktop {...viewProps} />
        : <DashboardGeneralMobile {...viewProps} />;
}