import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';

const TIPOS = [
    { value: 'TICKET', label: 'Ticket' },
    { value: 'PLANEADA', label: 'Planeada' },
    { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

const PRIORIDADES = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' },
];

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
    <div
        className={`relative overflow-hidden flex items-center ${className}`}
        style={{ ...glassBase('light'), borderRadius: 14 }}
    >
        <GlassSheen />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            <Icon name="search" size="sm" className="text-slate-500" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar ticket, área..."
            className="w-full pl-9 pr-8 py-2.5 text-xs bg-transparent relative z-10 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 rounded-[14px]
                       transition-all placeholder:text-slate-500 h-9.5"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-500 cursor-pointer z-10 active:scale-90 transition-transform"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange }) => {
    const selected = options.find((o) => o.value === value);
    const isActive = Boolean(value);

    return (
        <div className="relative w-full h-9.5">
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-20 appearance-none cursor-pointer"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <div
                style={isActive ? { ...glassBase('primary'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
                className={`
                    absolute inset-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all duration-200 pointer-events-none overflow-hidden
                    ${isActive ? 'text-white' : 'text-slate-600'}
                `}
            >
                <GlassSheen />
                <Icon name={icon} size="xs" className="relative shrink-0 z-10" />
                <span className="relative flex-1 truncate z-10">
                    {selected?.label ?? placeholder}
                </span>

                {isActive ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="relative z-30 flex items-center justify-center w-5 h-5 -mr-1 rounded-full bg-white/20 hover:bg-white/30 pointer-events-auto shrink-0 active:scale-90 transition-transform"
                    >
                        <Icon name="close" size="xs" className="text-white scale-75" />
                    </button>
                ) : (
                    <Icon name="expand_more" size="xs" className="text-slate-500 shrink-0 relative z-10" />
                )}
            </div>
        </div>
    );
};

const GlassFilterToggleBtn = ({ icon, label, isActive, count, showBadge, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={isActive ? { ...glassBase('danger'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
        className={`
            relative overflow-hidden w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold
            transition-all duration-200 active:scale-95 outline-none select-none h-[38px]
            ${isActive ? 'text-white' : 'text-slate-600'}
        `}
    >
        <GlassSheen />
        <Icon name={isActive ? 'close' : icon} size="xs" className="relative shrink-0 z-10" />
        <span className="relative truncate z-10">{label}</span>
        {showBadge && count > 0 && !isActive && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold leading-none border-2 border-white shadow-md z-20">
                {count > 99 ? '99+' : count}
            </span>
        )}
    </button>
);

export const MobileTicketFilterBar = ({
    query,
    onSearchChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    mostrarPapelera,
    onTogglePapelera,
    mostrarRechazadas,
    onToggleRechazadas,
    conteos = {}
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => onSearchChange(localValue), 450);
        return () => clearTimeout(timer);
    }, [localValue, onSearchChange]);

    const totalRechazadas = conteos['RECHAZADO'] ?? 0;
    const totalCanceladas = conteos['CANCELADA'] ?? 0;

    // Ya no incluimos "mostrarRechazadas" aquí para que el botón de filtros no se encienda por ellas.
    const hasActiveFilters = Boolean(filtroTipo || filtroPrioridad || mostrarPapelera);

    const handleClearFilters = () => {
        if (filtroTipo) onTipoChange('');
        if (filtroPrioridad) onPrioridadChange('');
        if (mostrarPapelera) onTogglePapelera();
        if (mostrarRechazadas) onToggleRechazadas(); // Lo limpiamos también por consistencia
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
        />
    ];

    filterElements.push(
        <GlassFilterToggleBtn
            key="canceladas"
            icon="delete"
            label="Canceladas"
            isActive={mostrarPapelera}
            count={totalCanceladas}
            showBadge={false}
            onClick={onTogglePapelera}
        />
    );

    // Condición para mostrar o parpadear el botón de Rechazadas
    const isRechazadasAlert = totalRechazadas > 0 && !mostrarRechazadas;

    return (
        <div className="w-full flex flex-col gap-2.5">
            {/* ── Fila 1: Buscador + Rechazadas Rápido + Botón Toggle Filtros ── */}
            <div className="flex items-center gap-2">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 min-w-0"
                />

                {/* ── Botón Rápido Rechazadas (Aparece si hay rechazadas o el filtro está activo) ── */}
                <button
                    type="button"
                    onClick={onToggleRechazadas}
                    style={mostrarRechazadas ? { ...glassBase('danger'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                            relative overflow-hidden flex items-center justify-center h-[38px] px-2.5 shrink-0 transition-all duration-200 active:scale-95 gap-1.5
                            ${isRechazadasAlert ? 'animate-pulse border border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.4)]' : ''}
                            ${mostrarRechazadas ? 'text-white' : 'text-slate-600'}
                        `}
                >
                    <GlassSheen />
                    <Icon name="block" size="sm" className={`relative z-10 ${isRechazadasAlert ? 'text-red-500' : ''}`} />

                    {totalRechazadas > 0 && (
                        <span className={`relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center leading-none
                                ${mostrarRechazadas ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}
                            `}>
                            {totalRechazadas}
                        </span>
                    )}
                </button>

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

            {/* ── Fila 2: Cuadrícula Expandible (Contenedor Glass) ── */}
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
                                <div key={el.key} className={isFirstAndOdd ? "col-span-2" : "col-span-1"}>
                                    {el}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-1 relative z-10">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters && !mostrarRechazadas}
                            style={(hasActiveFilters || mostrarRechazadas) ? { ...glassBase('light'), borderRadius: 10 } : {}}
                            className={`
                                relative overflow-hidden flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 transition-all duration-200
                                ${(hasActiveFilters || mostrarRechazadas)
                                    ? 'text-red-500 active:scale-95'
                                    : 'text-slate-400 pointer-events-none'
                                }
                            `}
                        >
                            {(hasActiveFilters || mostrarRechazadas) && <GlassSheen />}
                            <Icon name="filter_alt_off" size="xs" className="relative z-10" />
                            <span className="relative z-10">Limpiar filtros</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};