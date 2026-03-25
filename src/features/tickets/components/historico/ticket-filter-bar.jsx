// src/features/tickets/components/historico/ticket-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';

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

    useEffect(() => {
        const timer = setTimeout(() => onSearchChange(localValue), 450);
        return () => clearTimeout(timer);
    }, [localValue, onSearchChange]);

    const totalRechazadas = conteos['RECHAZADO'] ?? 0;

    const searchProps = {
        localValue,
        onChange: setLocalValue,
        onClear: () => setLocalValue(''),
    };

    return (
        <div className="flex items-center gap-3 w-full pt-2">
            <SearchInput {...searchProps} className="flex-1 max-w-sm min-w-50" />

            <div className="w-44 flex-none">
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

            <div className="w-40 flex-none">
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

            <div className="flex items-center gap-3 flex-none">
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
    );
};