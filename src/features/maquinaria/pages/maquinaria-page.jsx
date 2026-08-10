import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { useMaquinaria } from '../hooks/use-maquinaria';
import MaquinariaDesktop from '../views/maquinaria-desktop';
import MaquinariaMobile from '../views/maquinaria-mobile';
import { getBIMaquinariaKPIs } from '../api/bi-maquinaria-api';
import { getBIMaquinariaDefaultParams, useBIMaquinaria } from '../hooks/use-bi-maquinaria';
import { BI_ROLES, buildBiSummaryMap } from '../utils/bi-maquinaria-format';

const VALID_VIEWS = new Set(['MAQUINAS', 'EQUIPO', 'PROCESO', 'AREA']);

export default function MaquinariaPage() {
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const userRole = currentUser?.rol || currentUser?.role;
  const canUseBI = BI_ROLES.has(userRole);
  const requestedView = (searchParams.get('vista') || 'MAQUINAS').toUpperCase();
  const activeView = VALID_VIEWS.has(requestedView) ? requestedView : 'MAQUINAS';
  const activeAgrupacion = activeView === 'MAQUINAS' ? 'EQUIPO' : activeView;
  const bi = useBIMaquinaria({
    userRole,
    enabled: activeView !== 'MAQUINAS',
    fixedAgrupacion: activeAgrupacion,
  });
  const [biSummaryById, setBiSummaryById] = useState({});
  const [biSummaryLoading, setBiSummaryLoading] = useState(false);
  const [biSummaryError, setBiSummaryError] = useState('');
  const [biSummaryRevision, setBiSummaryRevision] = useState(0);
  const {
    maquinas,
    loading,
    submitting,
    pagination,
    filters,
    catalogs,
    fetchMaquinas,
    updateMaquina,
    getKpis,
    getDetails
  } = useMaquinaria();

  // Carga inicial
  useEffect(() => {
    if (activeView === 'MAQUINAS') {
      fetchMaquinas();
    }
  }, [activeView, fetchMaquinas]);

  const biCatalogParams = useMemo(() => ({
    ...getBIMaquinariaDefaultParams(),
    ...(biSummaryRevision > 0 ? { _revision: String(biSummaryRevision) } : {}),
    agrupacion: 'EQUIPO',
    buscar: filters.q || undefined,
    proceso: filters.proceso || undefined,
    area: filters.area || undefined,
    criticidad: filters.criticidad || undefined,
    estadoMaquina: filters.estado || undefined,
    pagina: 1,
    limite: 100,
  }), [biSummaryRevision, filters.area, filters.criticidad, filters.estado, filters.proceso, filters.q]);

  useEffect(() => {
    const handleBIInvalidated = () => setBiSummaryRevision(Date.now());
    window.addEventListener('bi-maquinaria-invalidada', handleBIInvalidated);
    window.addEventListener('cuadra-sync-complete', handleBIInvalidated);
    return () => {
      window.removeEventListener('bi-maquinaria-invalidada', handleBIInvalidated);
      window.removeEventListener('cuadra-sync-complete', handleBIInvalidated);
    };
  }, []);

  useEffect(() => {
    if (activeView !== 'MAQUINAS' || !canUseBI || maquinas.length === 0) {
      queueMicrotask(() => {
        setBiSummaryById({});
        setBiSummaryLoading(false);
      });
      return undefined;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      setBiSummaryLoading(true);
      setBiSummaryError('');
    });

    getBIMaquinariaKPIs(biCatalogParams, { signal: controller.signal })
      .then((response) => {
        const payload = response?.data || response;
        setBiSummaryById(buildBiSummaryMap(payload?.data || []));
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setBiSummaryById({});
        setBiSummaryError('No se pudo cargar el resumen de indicadores de maquinaria.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setBiSummaryLoading(false);
      });

    return () => controller.abort();
  }, [activeView, biCatalogParams, canUseBI, maquinas.length]);

  const handleViewChange = (nextView) => {
    const normalized = VALID_VIEWS.has(nextView) ? nextView : 'MAQUINAS';
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (normalized === 'MAQUINAS') {
        params.delete('vista');
      } else {
        params.set('vista', normalized);
      }
      return params;
    });
  };

  const handleBIDrilldown = (row) => {
    const nextFilters = {};
    if (activeView === 'PROCESO' && row?.proceso) {
      nextFilters.proceso = row.proceso;
    }
    if (activeView === 'AREA' && row?.area) {
      nextFilters.area = row.area;
    }
    if (Object.keys(nextFilters).length > 0) {
      bi.updateFilters(nextFilters);
    }
    handleViewChange('EQUIPO');
  };

  const handleFilterChange = (newFilters) => {
    fetchMaquinas(newFilters);
  };

  const handleClearFilters = () => {
    fetchMaquinas({
      q: '',
      estado: '',
      criticidad: '',
      area: '',
      proceso: '',
      page: 1
    });
  };

  const viewProps = {
    maquinas,
    loading,
    submitting,
    pagination,
    filters,
    catalogs,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    onRefresh: fetchMaquinas,
    updateMaquina,
    getKpis,
    getDetails,
    biSummaryById,
    biSummaryLoading,
    biSummaryError,
    activeView,
    onViewChange: handleViewChange,
    bi,
    onBIDrilldown: handleBIDrilldown
  };

  return (
    <div className="w-full max-w-full mx-auto p-1 lg:p-4 bg-transparent">
      {isDesktop ? (
        <MaquinariaDesktop {...viewProps} />
      ) : (
        <MaquinariaMobile {...viewProps} />
      )}
    </div>
  );
}
