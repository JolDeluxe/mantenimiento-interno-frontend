import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA } from '../../constants';
import { getDateRange, formatFechaNumerica } from '@/lib/date';

const normalizeOpts = (opts = []) => opts.map(o => {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const GlassDateRangeSelect = ({ icon, placeholder, value, onChange, quickOptions }) => {
    const isActive = Boolean(value.type);
    const isCustom = value.type === 'CUSTOM';

    const handleQuickChange = (newType) => {
        if (newType === 'CUSTOM') {
            onChange({ ...value, type: 'CUSTOM' });
        } else if (newType === '') {
            onChange({ type: '', start: '', end: '' });
        } else {
            const range = getDateRange(newType);
            onChange({ type: newType, start: range.startDate, end: range.endDate });
        }
    };

    const selectedLabel = quickOptions.find(o => o.value === value.type)?.label || (isCustom ? 'Personalizado' : placeholder);

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="relative w-full h-9.5">
                <select
                    value={value.type}
                    onChange={(e) => handleQuickChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 appearance-none cursor-pointer"
                >
                    <option value="">{placeholder}</option>
                    {quickOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                    <option value="CUSTOM">Personalizado</option>
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
                    <span className="relative flex-1 truncate z-10 uppercase">
                        {selectedLabel}
                    </span>

                    {isActive ? (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleQuickChange(''); }}
                            className="relative z-30 flex items-center justify-center w-5 h-5 -mr-1 rounded-full bg-white/20 hover:bg-white/30 pointer-events-auto shrink-0 active:scale-90 transition-transform"
                        >
                            <Icon name="close" size="xs" className="text-white scale-75" />
                        </button>
                    ) : (
                        <Icon name="expand_more" size="xs" className="text-slate-500 shrink-0 relative z-10" />
                    )}
                </div>
            </div>

            {isActive && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/40 border border-white/20 rounded-lg animate-in fade-in duration-300 relative overflow-hidden">
                    <GlassSheen />
                    <Icon name="calendar_today" size="xs" className="text-slate-500 relative z-10" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter relative z-10">
                        {value.start ? formatFechaNumerica(value.start) : '...'} - {value.end ? formatFechaNumerica(value.end) : '...'}
                    </span>
                </div>
            )}

            {isCustom && (
                <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <input
                        type="date"
                        value={value.start}
                        onChange={(e) => onChange({ ...value, start: e.target.value })}
                        className="flex-1 bg-white/50 border border-white/30 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none"
                    />
                    <span className="text-slate-500 text-[10px] font-bold">AL</span>
                    <input
                        type="date"
                        value={value.end}
                        onChange={(e) => onChange({ ...value, end: e.target.value })}
                        className="flex-1 bg-white/50 border border-white/30 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 outline-none"
                    />
                </div>
            )}
        </div>
    );
};

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
            placeholder="Buscar..."
            className="w-full pl-8 pr-7 py-2.5 text-xs bg-transparent relative z-10 text-slate-700
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 rounded-[14px]
                       transition-all placeholder:text-slate-500 h-9.5"
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
    const selected = options.find((o) => o.value === String(value));
    const isActive = Boolean(value);

    return (
        <div className="relative w-full h-9.5">
            <select
                value={value ? String(value) : ''}
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
        style={isActive ? { ...glassBase('dark'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
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
    query, onSearchChange,
    filtroTipo, onTipoChange,
    filtroPrioridad, onPrioridadChange,
    filtroResponsable, onResponsableChange, opcionesResponsables = [],
    filtroPlanta, onPlantaChange,
    filtroArea, onAreaChange,
    filtroClasificacion, onClasificacionChange,
    filtroProgramacion, onProgramacionChange,
    filtroConclusion, onConclusionChange,
    mostrarAtrasadas, onToggleAtrasadas,
    mostrarPapelera, onTogglePapelera,
    mostrarRechazadas, onToggleRechazadas,
    existenciaGlobal = {},
    totalAtrasadasGlobal = 0
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
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
        filtroTipo || filtroPrioridad || filtroResponsable ||
        filtroPlanta || filtroArea || filtroClasificacion ||
        filtroProgramacion.type || filtroConclusion.type ||
        mostrarAtrasadas || mostrarRechazadas || mostrarPapelera
    );

    const handleClearFilters = () => {
        if (filtroTipo) onTipoChange('');
        if (filtroPrioridad) onPrioridadChange('');
        if (filtroResponsable) onResponsableChange('');
        if (filtroPlanta) onPlantaChange('');
        if (filtroArea) onAreaChange('');
        if (filtroClasificacion) onClasificacionChange('');
        if (filtroProgramacion.type) onProgramacionChange({ type: '', start: '', end: '' });
        if (filtroConclusion.type) onConclusionChange({ type: '', start: '', end: '' });
        if (mostrarAtrasadas) onToggleAtrasadas();
        if (mostrarPapelera) onTogglePapelera();
        if (mostrarRechazadas) onToggleRechazadas();
    };

    const handlePlantaChange = (nuevaPlanta) => {
        onPlantaChange(nuevaPlanta);
        onAreaChange('');
    };

    const areasDisponibles = (filtroPlanta && AREAS_POR_PLANTA[filtroPlanta])
        ? AREAS_POR_PLANTA[filtroPlanta]
        : AREAS;

    const progOptions = [
        { label: 'HOY', value: 'HOY' },
        { label: 'MAÑANA', value: 'MANANA' },
        { label: 'ESTA SEMANA', value: 'ESTA_SEMANA' },
    ];

    const concOptions = [
        { label: 'HOY', value: 'HOY' },
        { label: 'AYER', value: 'AYER' },
        { label: 'ESTA SEMANA', value: 'ESTA_SEMANA' },
    ];

    const filterElements = [
        { key: 'tipo', el: <GlassNativeSelect icon="category" placeholder="Tipo" options={TIPOS} value={filtroTipo} onChange={onTipoChange} />, span2: false },
        { key: 'prioridad', el: <GlassNativeSelect icon="flag" placeholder="Prioridad" options={PRIORIDADES} value={filtroPrioridad} onChange={onPrioridadChange} />, span2: false },
        { key: 'clasificacion', el: <GlassNativeSelect icon="style" placeholder="Clasificación" options={CLASIFICACIONES} value={filtroClasificacion} onChange={onClasificacionChange} />, span2: false },
        { key: 'responsable', el: <GlassNativeSelect icon="person" placeholder="Responsable" options={normalizeOpts(opcionesResponsables)} value={filtroResponsable} onChange={onResponsableChange} />, span2: false },
        { key: 'planta', el: <GlassNativeSelect icon="domain" placeholder="Planta" options={normalizeOpts(PLANTAS)} value={filtroPlanta} onChange={handlePlantaChange} />, span2: false },
        { key: 'area', el: <GlassNativeSelect icon="place" placeholder="Área" options={normalizeOpts(areasDisponibles)} value={filtroArea} onChange={onAreaChange} />, span2: false },
        { key: 'programacion', el: <GlassDateRangeSelect icon="event_note" placeholder="FECHA DE CONCLUCIÓN" value={filtroProgramacion} onChange={onProgramacionChange} quickOptions={progOptions} />, span2: true },
        { key: 'conclusion', el: <GlassDateRangeSelect icon="task_alt" placeholder="CONCLUIDAS" value={filtroConclusion} onChange={onConclusionChange} quickOptions={concOptions} />, span2: true },
        { key: 'canceladas', el: <GlassFilterToggleBtn icon="delete" label="Canceladas" isActive={mostrarPapelera} count={0} showBadge={false} onClick={onTogglePapelera} />, span2: true }
    ];

    return (
        <div className="w-full flex flex-col gap-2.5">
            {/* BARRA SUPERIOR: Buscador + 2 Botones (Atrasadas, Rechazadas) + Toggle Filtros */}
            <div className="flex items-center gap-1.5 overflow-x-hidden">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="flex-1 min-w-[90px]"
                />

                {/* 1. ATRASADAS */}
                <button
                    type="button"
                    onClick={onToggleAtrasadas}
                    style={mostrarAtrasadas ? { ...glassBase('light'), backgroundColor: '#f59e0b', borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
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

                {/* 2. RECHAZADAS */}
                <button
                    type="button"
                    onClick={onToggleRechazadas}
                    style={mostrarRechazadas ? { ...glassBase('danger'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`
                        relative overflow-hidden flex items-center justify-center h-[38px] shrink-0 transition-all duration-200 active:scale-95
                        ${totalRechazadas > 0 && !mostrarRechazadas ? 'w-auto px-2 gap-1.5' : 'w-[38px]'}
                        ${isRechazadasAlert ? 'animate-pulse border border-red-400 shadow-[0_0_12px_rgba(220,38,38,0.4)]' : ''}
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

                {/* 3. TOGGLE FILTROS */}
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

            {/* MENÚ DE FILTROS DESPLEGABLE */}
            {showFilters && (
                <div
                    className="flex flex-col gap-3 p-3 rounded-[20px] relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={glassBase('light')}
                >
                    <GlassSheen />
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        {filterElements.map((item) => (
                            <div key={item.key} className={item.span2 ? "col-span-2" : "col-span-1"}>
                                {item.el}
                            </div>
                        ))}
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
                            <span className="relative z-10">Limpiar filtros</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};