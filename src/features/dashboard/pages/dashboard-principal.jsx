import { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { usePrincipal } from '../hooks/use-principal';
import DashboardPrincipalDesktop from '../views/dashboard-principal-desktop';
import DashboardPrincipalMobile from '../views/dashboard-principal-mobile';

export default function DashboardPrincipalPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const { data, loading, error, fetchPrincipal } = usePrincipal();

    useEffect(() => {
        fetchPrincipal();
    }, [fetchPrincipal]);

    const viewProps = { data, loading, error, currentUser, onRefresh: fetchPrincipal };

    return isDesktop
        ? <DashboardPrincipalDesktop {...viewProps} />
        : <DashboardPrincipalMobile  {...viewProps} />;
}