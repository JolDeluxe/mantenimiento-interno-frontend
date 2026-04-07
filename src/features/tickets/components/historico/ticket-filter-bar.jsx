import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { TIPOS, PRIORIDADES, CLASIFICACIONES, PLANTAS, AREAS, AREAS_POR_PLANTA } from '../../constants';

const normalizeOpts = (opts = []) => opts.map(o => {
    if (typeof o === 'string') return { value: o, label: o };
    return { value: String(o.value ?? o.id), label: String(o.label ?? o.nombre) };
});

const SearchInput = ({ localValue, onChange, onClear, className = "w-full" }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Buscar ticket, área, ID…"
            className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white
                       focus:outline-none focus:ring-2 focus:ring-marca-secundario/20
                       focus:border-marca-secundario transition-all placeholder:text-slate-400 h-9.5"
        />
        {localValue && (
            <button
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const TicketFilterBar = ({
    query, onSearchChange,
    filtroTipo, onTipoChange,
    filtroPrioridad, onPrioridadChange,
    filtroResponsable, onResponsableChange, opcionesResponsables = [],
    filtroPlanta, onPlantaChange,
    filtroArea, onAreaChange,
    filtroClasificacion, onClasificacionChange,
    mostrarAtrasadas, onToggleAtrasadas,
    mostrarPapelera, onTogglePapelera,
    mostrarRechazadas, onToggleRechazadas,
    existenciaGlobal = {},
    totalAtrasadasGlobal = 0
}) => {
    const [localValue, setLocalValue] = useState(query || '');

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
    const totalCanceladas = existenciaGlobal['CANCELADA'] ?? 0;
    const totalAtrasadas = totalAtrasadasGlobal;

    const searchProps = {
        localValue,
        onChange: setLocalValue,
        onClear: () => setLocalValue(''),
    };

    // 1. Interceptor: Si cambia la planta, reseteamos el filtro de área
    const handlePlantaChange = (nuevaPlanta) => {
        onPlantaChange(nuevaPlanta);
        onAreaChange('');
    };

    // 2. Select Dinámico: Resuelve las áreas filtradas o muestra todas
    const areasDisponibles = (filtroPlanta && AREAS_POR_PLANTA[filtroPlanta])
        ? AREAS_POR_PLANTA[filtroPlanta]
        : AREAS;

    return (
        <div className="flex flex-col gap-3 w-full pt-2">
            {/* Fila 1: Mantenemos tu código exacto original */}
            <div className="flex items-center gap-3 w-full">
                <SearchInput {...searchProps} className="flex-1 max-w-md min-w-50" />

                <div className="flex items-center gap-3 flex-none ml-auto">
                    {/* 1. Botón Atrasadas (CON BADGE) */}
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarAtrasadas}
                            icon={mostrarAtrasadas ? 'close' : 'warning'}
                            size="sm"
                            onClick={onToggleAtrasadas}
                            className={`w-34 flex-none justify-center h-9.5 ${mostrarAtrasadas ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent ring-0' : ''}`}
                        >
                            Atrasadas
                        </Button>
                        {totalAtrasadas > 0 && !mostrarAtrasadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalAtrasadas}
                            </span>
                        )}
                    </div>

                    {/* 2. Botón Rechazadas (CON BADGE) */}
                    <div className="relative">
                        <Button
                            variant="filtro_rechazado"
                            isActive={mostrarRechazadas}
                            icon={mostrarRechazadas ? 'close' : 'block'}
                            size="sm"
                            onClick={onToggleRechazadas}
                            className="w-34 flex-none justify-center h-9.5"
                        >
                            Rechazadas
                        </Button>
                        {totalRechazadas > 0 && !mostrarRechazadas && (
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalRechazadas}
                            </span>
                        )}
                    </div>

                    {/* 3. Botón Canceladas (SIN BADGE) */}
                    <div className="relative">
                        <Button
                            variant="filtro_gris"
                            isActive={mostrarPapelera}
                            icon={mostrarPapelera ? 'close' : 'delete'}
                            size="sm"
                            onClick={onTogglePapelera}
                            className="w-34 flex-none justify-center h-9.5"
                        >
                            Canceladas
                        </Button>
                    </div>
                </div>
            </div>

            {/* Fila 2: Implementación de adaptación elástica (min-w y w-auto) */}
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

                <div className="min-w-44 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={CLASIFICACIONES}
                        value={filtroClasificacion}
                        onChange={onClasificacionChange}
                        placeholder="Clasificación..."
                        icon="style"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>

                <div className="min-w-48 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={normalizeOpts(opcionesResponsables)} // Viene de BD (props)
                        value={filtroResponsable ? String(filtroResponsable) : ''}
                        onChange={onResponsableChange}
                        placeholder="Responsable..."
                        icon="person"
                        allOptionText="Cualquiera"
                        className="w-full"
                    />
                </div>

                <div className="min-w-40 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={normalizeOpts(PLANTAS)}
                        value={filtroPlanta ? String(filtroPlanta) : ''}
                        onChange={handlePlantaChange}
                        placeholder="Planta..."
                        icon="domain"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>

                <div className="min-w-40 w-auto max-w-full flex-none">
                    <SearchableSelect
                        options={normalizeOpts(areasDisponibles)}
                        value={filtroArea ? String(filtroArea) : ''}
                        onChange={onAreaChange}
                        placeholder="Área..."
                        icon="place"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};