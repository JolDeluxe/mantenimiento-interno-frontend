// src/features/usuarios/components/user-filter-bar.jsx
import { useState, useEffect, useMemo } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { MobileChipSelect } from '@/components/form/z_index';
import { cn } from '@/utils/cn';

// ── FUERA del componente — tipo estable entre renders, el input nunca se desmonta ──
const SearchInput = ({ localValue, onChange, onClear, mostrarInactivos }) => (
  <div className="relative w-full lg:max-w-sm shrink-0">
    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
      <Icon name="search" size="sm" className="text-slate-400" />
    </div>
    <input
      type="text"
      value={localValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={mostrarInactivos ? 'Buscar inactivos…' : 'Buscar usuario…'}
      className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                 focus:border-marca-secundario transition-all placeholder:text-slate-400"
    />
    {localValue && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400"
      >
        <Icon name="close" size="xs" />
      </button>
    )}
  </div>
);

export const UserFilterBar = ({
  currentUser,
  departamentos,
  query,
  onSearchChange,
  mostrarInactivos,
  onToggleInactivos,
  filtroDepto,
  onDeptoChange,
  isMttoFilter,
  onToggleMttoFilter,
  mobileSearchOnly = false,
}) => {
  const [localValue, setLocalValue] = useState(query || '');

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(localValue), 450);
    return () => clearTimeout(timer);
  }, [localValue, onSearchChange]);

  const esSuperAdmin = currentUser?.rol === 'SUPER_ADMIN';

  const deptoOptions = useMemo(
    () => departamentos?.map((d) => ({ value: d.id, label: d.nombre })) || [],
    [departamentos]
  );

  const searchProps = {
    localValue,
    onChange: setLocalValue,
    onClear: () => setLocalValue(''),
    mostrarInactivos,
  };

  if (mobileSearchOnly) return <SearchInput {...searchProps} />;

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* CAPA MÓVIL */}
      <div className="flex flex-col gap-3 lg:hidden">
        <SearchInput {...searchProps} />

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          <button
            onClick={onToggleInactivos}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0",
              mostrarInactivos
                ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100"
                : "bg-white border-slate-200 text-slate-600"
            )}
          >
            <Icon name={mostrarInactivos ? 'close' : 'person_off'} size="xs" />
            Inactivos
          </button>

          {esSuperAdmin && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={onToggleMttoFilter}
                disabled={!!filtroDepto}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0",
                  isMttoFilter
                    ? "bg-marca-primario border-marca-primario text-white"
                    : "bg-white border-slate-200 text-slate-600",
                  filtroDepto && "opacity-40 pointer-events-none"
                )}
              >
                <Icon name="construction" size="xs" />
                Mtto
              </button>

              <div className={cn(
                "transition-all shrink-0",
                isMttoFilter && "opacity-40 pointer-events-none"
              )}>
                <MobileChipSelect
                  options={deptoOptions}
                  value={filtroDepto}
                  onChange={onDeptoChange}
                  placeholder="Todos los Deptos"
                  icon="business"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAPA DESKTOP */}
      <div className="hidden lg:flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3 flex-1">
          <SearchInput {...searchProps} />

          {esSuperAdmin && !filtroDepto && (
            <Button
              variant={isMttoFilter ? 'primario' : 'default'}
              icon="construction"
              size="sm"
              onClick={onToggleMttoFilter}
              className="h-10 px-4"
            >
              Mantenimiento
            </Button>
          )}

          {esSuperAdmin && !isMttoFilter && (
            <div className="w-64">
              <SearchableSelect
                options={deptoOptions}
                value={filtroDepto}
                onChange={onDeptoChange}
                placeholder="Departamento..."
                icon="business"
                allOptionText="Todos los Departamentos"
              />
            </div>
          )}
        </div>

        <Button
          variant={mostrarInactivos ? 'borrar' : 'default'}
          icon={mostrarInactivos ? 'close' : 'person_off'}
          size="sm"
          onClick={onToggleInactivos}
          className="h-10 px-4"
        >
          Inactivos
        </Button>
      </div>

    </div>
  );
};