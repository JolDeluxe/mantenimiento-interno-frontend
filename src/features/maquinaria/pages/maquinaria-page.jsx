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
    fetchMaquinas,
    createMaquina,
    updateMaquina,
    changeStatus,
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
      page: 1
    });
  };

  const viewProps = {
    maquinas,
    loading,
    submitting,
    pagination,
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: handleClearFilters,
    createMaquina,
    updateMaquina,
    changeStatus,
    getKpis,
    getDetails
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 md:p-6 bg-transparent">
      {isDesktop ? (
        <MaquinariaDesktop {...viewProps} />
      ) : (
        <MaquinariaMobile {...viewProps} />
      )}
    </div>
  );
}