// src/features/hoy/components/hoy-actividades/mobile-actividades-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { TIPOS, PRIORIDADES, ROLES_ADMIN, CATEGORIAS_EQUIPO, AREAS } from '@/features/common/constants/catalogos-tareas';

const normalizeOpts = (opts = []) =>
    opts.map(o =>
        typeof o === 'string'
            ? { value: o, label: o }
            : { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) }
    );

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
    <div
        className={`relative overflow-hidden flex items-center ${className}`}
        style={{ ...glassBase('light'), borderRadius: 14 }}
    >
        <GlassSheen />
        <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none z-10">
            <Icon name="search" size="sm" className="text-slate-500" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar tarea o máquina..."
            className="w-full pl-8 pr-7 py-2.5 text-xs bg-transparent relative z-10 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 rounded-[14px]
                       transition-all placeholder:text-slate-500 h-[38px]"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-1.5 flex items-center px-2 text-slate-500 cursor-pointer z-10 active:scale-90 transition-transform"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange }) => {
    const isActive = Boolean(value);

    return (
        <div className="relative w-full h-[38px]">
            <select
                value={value ? String(value) : ''}
                onChange={(e) => onChange(e.target.value)}
                style={isActive ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                className={`
                    w-full h-full pl-8 pr-6 text-xs bg-transparent appearance-none border-none outline-none select-none relative z-10 font-bold transition-colors
                    ${isActive ? 'text-white' : 'text-slate-600'}
                `}
            >
                <option value="" className="text-slate-800 bg-white font-medium">{placeholder}: Todos</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value} className="text-slate-800 bg-white font-medium">
                        {o.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none z-10">
                <Icon name={icon} size="xs" className={isActive ? 'text-white/90' : 'text-slate-400'} />
            </div>
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none z-10">
                <Icon name="expand_more" size="xs" className={isActive ? 'text-white/70' : 'text-slate-400'} />
            </div>
            {isActive && <GlassSheen />}
        </div>
    );
};

export const MobileActividadesFilterBar = ({
    query,
    onSearchChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    filtroCategoria,
    onCategoriaChange,
    filtroArea,
    onAreaChange,
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
    onOpenDrawerAmnistia,
    puedeFiltrarAtrasadasRechazadas = true,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [showFilters, setShowFilters] = useState(false);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);
    const esCoordinador = currentUser?.rol === 'COORDINADOR_MTTO';

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(query || '');
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onSearchChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, query, onSearchChange]);

    const totalRechazadas = existenciaGlobal['RECHAZADO'] ?? 0;
    const totalAtrasadas = totalAtrasadasGlobal ?? 0;

    const isAtrasadasAlert = totalAtrasadas > 0 && !mostrarAtrasadas;
    const isRechazadasAlert = totalRechazadas > 0 && !mostrarRechazadas;

    const hasActiveFilters = Boolean(
        filtroTipo || filtroPrioridad || filtroCategoria || filtroArea || filtroResponsable ||
        mostrarAtrasadas || mostrarRechazadas
    );

    const handleClearFilters = () => {
        if (filtroTipo) onTipoChange('');
        if (filtroPrioridad) onPrioridadChange('');
        if (filtroCategoria) onCategoriaChange('');
        if (filtroArea) onAreaChange('');
        if (filtroResponsable) onResponsableChange('');
        if (mostrarAtrasadas) onToggleAtrasadas();
        if (mostrarRechazadas) onToggleRechazadas();
    };

    const filterElements = [
        <GlassNativeSelect
            key="tipo"
            icon="category"
            placeholder="Tipo"
            options={TIPOS}
            value={filtroTipo}
            onChange={onTipoChange}
        />,
        <GlassNativeSelect
            key="prioridad"
            icon="flag"
            placeholder="Prioridad"
            options={PRIORIDADES}
            value={filtroPrioridad}
            onChange={onPrioridadChange}
        />,
        <GlassNativeSelect
            key="categoria"
            icon="label"
            placeholder="Categoría"
            options={CATEGORIAS_EQUIPO}
            value={filtroCategoria}
            onChange={onCategoriaChange}
        />,
        <GlassNativeSelect
            key="area"
            icon="place"
            placeholder="Área"
            options={normalizeOpts(AREAS)}
            value={filtroArea}
            onChange={onAreaChange}
        />
    ];

    if (esAdmin) {
        filterElements.push(
            <GlassNativeSelect
                key="responsable"
                icon="person"
                placeholder="Responsable"
                options={normalizeOpts(opcionesResponsables)}
                value={filtroResponsable}
                onChange={onResponsableChange}
            />
        );
    }

    return (
        <div className="flex flex-col gap-2.5 w-full">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 min-w-[90px]"
                />

                {puedeFiltrarAtrasadasRechazadas && (
                <button
                    type="button"
                    onClick={onToggleAtrasadas}
                    style={mostrarAtrasadas ? { ...glassBase('light'), background: '#f59e0b', borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                        relative overflow-hidden flex items-center justify-center h-[38px] shrink-0 transition-all duration-200 active:scale-95
                        ${totalAtrasadas > 0 && !mostrarAtrasadas ? 'w-auto px-2 gap-1.5' : 'w-[38px]'}
                        ${mostrarAtrasadas ? 'text-white' : 'text-slate-600'}
                    `}
                >
                    <GlassSheen />
                    <Icon name="warning" size="sm" className={`relative z-10 ${isAtrasadasAlert ? 'text-amber-500' : ''}`} />
                    {totalAtrasadas > 0 && !mostrarAtrasadas && (
                        <span className="relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none bg-amber-100 text-amber-600">
                            {totalAtrasadas}
                        </span>
                    )}
                </button>
                )}

                {puedeFiltrarAtrasadasRechazadas && (
                <button
                    type="button"
                    onClick={onToggleRechazadas}
                    style={mostrarRechazadas ? { ...glassBase('danger'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                        relative overflow-hidden flex items-center justify-center h-[38px] shrink-0 transition-all duration-200 active:scale-95
                        ${mostrarRechazadas ? 'text-white' : 'text-slate-600'}
                    `}
                >
                    <GlassSheen />
                    <Icon name="block" size="sm" className={`relative z-10 ${isRechazadasAlert ? 'text-red-500' : ''}`} />
                    {totalRechazadas > 0 && !mostrarRechazadas && (
                        <span className="relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none bg-red-100 text-red-600">
                            {totalRechazadas}
                        </span>
                    )}
                </button>
                )}

                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    style={showFilters || hasActiveFilters ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                        relative overflow-hidden flex items-center justify-center w-[38px] h-[38px] shrink-0 transition-all duration-200 active:scale-95
                        ${showFilters || hasActiveFilters ? 'text-white' : 'text-slate-600'}
                    `}
                >
                    <GlassSheen />
                    <Icon name="filter_alt" size="sm" className="relative z-10" />
                    {hasActiveFilters && !showFilters && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-marca-acento rounded-full border-2 border-white z-20"></span>
                    )}
                </button>
            </div>

            {puedeFiltrarAtrasadasRechazadas && mostrarAtrasadas && esAdmin && onOpenDrawerAmnistia && (
                <button
                    type="button"
                    onClick={onOpenDrawerAmnistia}
                    style={{ ...glassBase('light'), borderRadius: 14, background: '#fefce8', borderColor: '#fcd34d' }}
                    className="relative overflow-hidden flex items-center justify-center gap-2 h-[38px] w-full transition-all duration-200 active:scale-[0.98] text-amber-700 animate-in fade-in slide-in-from-top-1 duration-200"
                >
                    <GlassSheen />
                    <Icon name="schedule_send" size="sm" className="relative z-10" />
                    <span className="relative z-10 text-[11px] font-black">Reprogramar atrasadas</span>
                </button>
            )}

            {showFilters && (
                <div
                    className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={glassBase('light')}
                >
                    <GlassSheen />
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        {filterElements.map((el, index) => {
                            const isOddLength = filterElements.length % 2 !== 0;
                            const isFirstAndOdd = isOddLength && index === 0;

                            return (
                                <div key={el.key || index} className={isFirstAndOdd ? "col-span-2" : "col-span-1"}>
                                    {el}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-1 relative z-10">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            style={hasActiveFilters ? { ...glassBase('light'), borderRadius: 10 } : {}}
                            className={`
                                relative overflow-hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all duration-200
                                ${hasActiveFilters
                                    ? 'text-red-500 active:scale-95'
                                    : 'text-slate-400 pointer-events-none'
                                }
                            `}
                        >
                            {hasActiveFilters && <GlassSheen />}
                            <Icon name="filter_alt_off" size="xs" className="relative z-10" />
                            <span className="relative z-10">Limpiar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

