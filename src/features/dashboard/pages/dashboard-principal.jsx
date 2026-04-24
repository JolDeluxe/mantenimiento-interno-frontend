// src/features/dashboard/pages/dashboard-principal.jsx
import { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { usePrincipal } from '../hooks/use-principal';

// Vistas Administrativas (Jefe, SuperAdmin, Coordinador)
import DashboardPrincipalDesktop from '../views/dashboard-principal-desktop';
import DashboardPrincipalMobile from '../views/dashboard-principal-mobile';

// Vistas Exclusivas Operativas (Técnico)
import DashboardTecnicoDesktop from '../views/dashboard-tecnico-desktop';
import DashboardTecnicoMobile from '../views/dashboard-tecnico-mobile';

export default function DashboardPrincipalPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const { data, loading, error, fetchPrincipal } = usePrincipal();

    useEffect(() => {
        fetchPrincipal();
    }, [fetchPrincipal]);

    const viewProps = { data, loading, error, currentUser, onRefresh: fetchPrincipal };

    const esTecnico = currentUser?.rol === 'TECNICO';

    // Ruteo Visual por Capas y Roles
    if (esTecnico) {
        return isDesktop
            ? <DashboardTecnicoDesktop {...viewProps} />
            : <DashboardTecnicoMobile {...viewProps} />;
    }

    // Fallback para JEFE_MTTO, COORDINADOR_MTTO, SUPER_ADMIN
    return isDesktop
        ? <DashboardPrincipalDesktop {...viewProps} />
        : <DashboardPrincipalMobile {...viewProps} />;
}