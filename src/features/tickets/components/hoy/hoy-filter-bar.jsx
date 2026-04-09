import { useState, useEffect } from 'react';
import { Icon, SearchableSelect } from '@/components/ui/z_index';
import { TIPOS, PRIORIDADES, ROLES_ADMIN } from '../../constants';

const ESTADOS_HOY = [
    { value: 'ASIGNADA', label: 'Asignada' },
    { value: 'EN_PAUSA', label: 'En Pausa' },
    { value: 'EN_PROGRESO', label: 'En Progreso' },
    { value: 'RESUELTO', label: 'Resuelto' },
];

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
    filtroEstado,
    onEstadoChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroResponsable,
    onResponsableChange,
    opcionesResponsables = [],
    currentUser,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    useEffect(() => { setLocalValue(query || ''); }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    // TECNICO: solo filtro de estado
    if (!esAdmin) {
        return (
            <div className="flex flex-col gap-3 w-full pt-1">
                {/* Fila 1: búsqueda */}
                <div className="flex items-center gap-3 w-full">
                    <SearchInput
                        localValue={localValue}
                        onChange={setLocalValue}
                        onClear={() => setLocalValue('')}
                        className="flex-1 max-w-md min-w-[180px]"
                    />
                </div>

                {/* Fila 2: filtros adicionales elásticos */}
                <div className="flex items-center gap-3 w-full flex-wrap">
                    <div className="min-w-52 w-auto max-w-full flex-none">
                        <SearchableSelect
                            options={ESTADOS_HOY}
                            value={filtroEstado}
                            onChange={onEstadoChange}
                            placeholder="Todos los estados"
                            icon="swap_horiz"
                            allOptionText="Todos los estados"
                            className="w-full"
                        />
                    </div>
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
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 w-full pt-1">
            {/* Fila 1: búsqueda */}
            <div className="flex items-center gap-3 w-full">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 max-w-md min-w-[180px]"
                />
            </div>

            {/* Fila 2: filtros adicionales elásticos */}
            <div className="flex items-center gap-3 w-full flex-wrap">
                <div className="min-w-52 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={ESTADOS_HOY}
                        value={filtroEstado}
                        onChange={onEstadoChange}
                        placeholder="Todos los estados"
                        icon="swap_horiz"
                        allOptionText="Todos los estados"
                        className="w-full"
                    />
                </div>
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
                {opcionesResponsables.length > 0 && (
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