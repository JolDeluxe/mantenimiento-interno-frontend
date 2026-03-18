// src/features/usuarios/components/user-filter-bar.jsx
import { useState, useEffect, useMemo } from 'react';
import { Icon, Tooltip, Button, SearchableSelect } from '@/components/ui/z_index';
import { GlassViewToggle } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

/**
 * Props nuevas:
 *   glassMode → boolean — cuando true, el botón de Inactivos usa estética Glass
 *                         (para vista mobile). Default: false.
 */
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
  glassMode = false,
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

  // ── Botón Inactivos en modo Glass ──────────────────────────────────────
  const InactivosButton = () => {
    if (glassMode) {
      return (
        <GlassViewToggle
          options={[
            {
              id: 'inactivos',
              label: 'Inactivos',
              icon: mostrarInactivos ? 'person_check' : 'person_off',
            },
          ]}
          value={mostrarInactivos ? 'inactivos' : null}
          onChange={() => onToggleInactivos()}
          activeVariant={mostrarInactivos ? 'danger' : 'neutral'}
        />
      );
    }

    // Versión desktop original
    return (
      <Tooltip
        text={mostrarInactivos ? 'Quitar filtro de inactivos' : 'Ver usuarios inactivos'}
        variant="dark"
        position="left"
      >
        <div className="inline-block shrink-0">
          <Button
            variant={mostrarInactivos ? 'borrar' : 'ghost'}
            icon={mostrarInactivos ? 'close' : 'person_off'}
            size="sm"
            onClick={onToggleInactivos}
            className="py-1.5 px-3 text-xs h-9.5 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Inactivos</span>
          </Button>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">

      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto flex-1">

        {/* Buscador */}
        <div className="relative w-full max-w-sm shrink-0">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
          </div>
          <input
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            placeholder={mostrarInactivos ? 'Buscar en inactivos…' : 'Buscar por nombre o usuario…'}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
                       focus:border-marca-secundario transition-all placeholder:text-slate-400"
          />
          {localValue && (
            <div className="absolute inset-y-0 right-1 flex items-center">
              <Tooltip text="Borrar búsqueda" variant="dark" position="top">
                <button
                  onClick={() => setLocalValue('')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100 flex items-center justify-center"
                >
                  <Icon name="close" size="xs" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Botón Mantenimiento */}
        {esSuperAdmin && !filtroDepto && (
          <Tooltip
            text={isMttoFilter ? 'Quitar filtro de mantenimiento' : 'Filtrar por Mantenimiento'}
            variant="dark"
            position="top"
          >
            <div className="inline-block shrink-0">
              <Button
                variant={isMttoFilter ? 'primario' : 'ghost'}
                icon="construction"
                size="sm"
                onClick={onToggleMttoFilter}
                className="py-1.5 px-3 text-xs h-9.5 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Mantenimiento</span>
              </Button>
            </div>
          </Tooltip>
        )}

        {/* Selector Departamentos */}
        {esSuperAdmin && !isMttoFilter && (
          <SearchableSelect
            options={deptoOptions}
            value={filtroDepto}
            onChange={onDeptoChange}
            placeholder="Departamento..."
            searchPlaceholder="Buscar departamento..."
            allOptionText="Todos los departamentos"
            icon="business"
          />
        )}
      </div>

      {/* Inactivos */}
      <div className={cn(
        'flex items-center shrink-0 w-full md:w-auto',
        glassMode ? 'justify-start' : 'justify-end'
      )}>
        <InactivosButton />
      </div>

    </div>
  );
};