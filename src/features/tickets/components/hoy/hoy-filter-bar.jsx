// src/features/tickets/components/hoy/hoy-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { TIPOS, PRIORIDADES, ROLES_ADMIN } from '../../constants';
import { HoyTeamToggle } from './hoy-team-toggle';

const normalizeOpts = (opts = []) =>
    opts.map(o =>
        typeof o === 'string'
            ? { value: o, label: o }
            : { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) }
    );

const SearchInput = ({ localValue, onChange, onClear, className = 'w-full' }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar tarea, área, ID…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                       focus:border-marca-secundario transition-all placeholder:text-slate-400 h-[38px]"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer hover:text-slate-600"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const HoyFilterBar = ({
    query,
    onSearchChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    opcionesResponsables = [],
    mostrarAtrasadas,
    onToggleAtrasadas,
    mostrarRechazadas,
    onToggleRechazadas,
    existenciaGlobal = {},
    totalAtrasadasGlobal = 0,
    currentUser,
    vistaEquipo,
    onVistaEquipoChange,
    equipoCount = 0,
    misTareasCount = 0,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);
    const esCoordinador = currentUser?.rol === 'COORDINADOR_MTTO';

    useEffect(() => { setLocalValue(query || ''); }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    const totalRechazadas = existenciaGlobal['RECHAZADO'] ?? 0;
    const totalAtrasadas = totalAtrasadasGlobal;

    return (
        <div className="flex flex-col gap-3 w-full pt-1">
            <div className="flex items-center gap-3 w-full">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 max-w-md min-w-[180px]"
                />

                {esCoordinador && (
                    <div className="flex-none">
                        <HoyTeamToggle 
                            vistaEquipo={vistaEquipo} 
                            onChange={onVistaEquipoChange} 
                            equipoCount={equipoCount}
                            misTareasCount={misTareasCount}
                        />
                    </div>
                )}

                <div className="flex items-center gap-3 flex-none ml-auto">
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={`w-34 flex-none justify-center h-[38px] ${mostrarAtrasadas ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0' : ''}`}
                        >
                            Atrasadas
                        </Button>
                        {totalAtrasadas > 0 && !mostrarAtrasadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalAtrasadas}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            variant="filtro_rechazado"
                            isActive={mostrarRechazadas}
                            icon={mostrarRechazadas ? 'close' : 'block'}
                            size="sm"
                            onClick={onToggleRechazadas}
                            className="w-34 flex-none justify-center h-[38px]"
                        >
                            Rechazadas
                        </Button>
                        {totalRechazadas > 0 && !mostrarRechazadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalRechazadas}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full flex-wrap">
                <div className="min-w-40 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={TIPOS}
                        value={filtroTipo}
                        onChange={onTipoChange}
                        placeholder="Tipo..."
                        icon="category"
                        allOptionText="Todos los tipos"
                        className="w-full"
                    />
                </div>
                <div className="min-w-40 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={PRIORIDADES}
                        value={filtroPrioridad}
                        onChange={onPrioridadChange}
                        placeholder="Prioridad..."
                        icon="flag"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
                {esAdmin && opcionesResponsables.length > 0 && (
                    <div className="min-w-48 w-auto max-w-full flex-none">
                        <SearchableSelect
                            options={normalizeOpts(opcionesResponsables)}
                            value={filtroResponsable ? String(filtroResponsable) : ''}
                            onChange={onResponsableChange}
                            placeholder="Responsable..."
                            icon="person"
                            allOptionText="Cualquiera"
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};