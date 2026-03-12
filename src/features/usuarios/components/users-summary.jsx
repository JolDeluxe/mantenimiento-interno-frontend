import { SummaryBar } from '@/components/ui/z_index';

export const UsersSummary = ({ total, conteos, loading, filtroActual, onFilterChange }) => {
  
  // 1. Mapeamos la data de la API al formato que exige nuestro componente UI
  const items = [
    { id: "TODOS", label: "Total", value: total, color: "default" },
    { id: "ADMIN", label: "Gestión", value: conteos["ADMIN"] || 0, color: "amber" },
    { id: "ENCARGADO", label: "Supervisión", value: conteos["ENCARGADO"] || 0, color: "blue" },
    { id: "USUARIO", label: "Operativo", value: conteos["USUARIO"] || 0, color: "rose" },
  ];

  // 2. Manejamos la lógica de negocio (deseleccionar si ya estaba activo)
  const handleSelect = (clickedId) => {
    if (loading) return;
    // Si clickea el que ya está activo (y no es TODOS), regresamos a la vista general
    if (clickedId === filtroActual && clickedId !== "TODOS") {
      onFilterChange("TODOS");
    } else {
      onFilterChange(clickedId);
    }
  };

  return (
    <SummaryBar 
      items={items} 
      activeId={filtroActual} 
      onSelect={handleSelect} 
      loading={loading} 
    />
  );
};