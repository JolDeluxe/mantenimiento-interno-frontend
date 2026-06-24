import React, { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useMaquinaria } from '../hooks/use-maquinaria';
import MaquinariaDesktop from '../views/maquinaria-desktop';
import MaquinariaMobile from '../views/maquinaria-mobile';

export default function MaquinariaPage() {
  const isDesktop = useIsDesktop();
  const {
    maquinas,
    loading,
    submitting,
    pagination,
    filters,
    catalogs,
    fetchMaquinas,
    createMaquina,
    updateMaquina,
    getKpis,
    getDetails
  } = useMaquinaria();

  // Carga inicial
  useEffect(() => {
    fetchMaquinas();
  }, []);

  const handleFilterChange = (newFilters) => {
    fetchMaquinas(newFilters);
  };

  const handleClearFilters = () => {
    fetchMaquinas({
      q: '',
      estado: '',
      criticidad: '',
      planta: '',
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
    createMaquina,
    updateMaquina,
    getKpis,
    getDetails
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