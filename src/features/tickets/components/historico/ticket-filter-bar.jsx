// src/features/tickets/components/historico/ticket-filter-bar.jsx
import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { MobileChipSelect } from '@/components/form/z_index';
import { cn } from '@/utils/cn';

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

const SearchInput = ({ localValue, onChange, onClear }) => (
    <div className="relative w-full lg:max-w-sm shrink-0">
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
                 focus:border-marca-secundario transition-all placeholder:text-slate-400"
        />
        {localValue && (
            <button onClick={onClear} className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400">
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

/**
 * Props:
 *   query / onSearchChange
 *   filtroTipo / onTipoChange
 *   filtroPrioridad / onPrioridadChange
 *   mostrarPapelera / onTogglePapelera  → toggle CANCELADA + RECHAZADO
 *   mobileSearchOnly                    → para la capa de search en móvil (users-mobile pattern)
 */
export const TicketFilterBar = ({
    query,
    onSearchChange,
    filtroTipo,
    onTipoChange,
    filtroPrioridad,
    onPrioridadChange,
    mostrarPapelera,
    onTogglePapelera,
    mobileSearchOnly = false,
}) => {
    const [localValue, setLocalValue] = useState(query || '');

    useEffect(() => {
        const timer = setTimeout(() => onSearchChange(localValue), 450);
        return () => clearTimeout(timer);
    }, [localValue, onSearchChange]);

    const searchProps = {
        localValue,
        onChange: setLocalValue,
        onClear: () => setLocalValue(''),
    };

    if (mobileSearchOnly) return <SearchInput {...searchProps} />;

    return (
        <div className="flex flex-col gap-3 w-full">

            {/* ── MÓVIL ── */}
            <div className="flex flex-col gap-3 lg:hidden">
                <SearchInput {...searchProps} />

                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                    <button
                        onClick={onTogglePapelera}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0',
                            mostrarPapelera
                                ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100'
                                : 'bg-white border-slate-200 text-slate-600'
                        )}
                    >
                        <Icon name={mostrarPapelera ? 'close' : 'delete'} size="xs" />
                        Papelera
                    </button>

                    <div className="shrink-0 w-36">
                        <MobileChipSelect
                            options={TIPOS}
                            value={filtroTipo}
                            onChange={onTipoChange}
                            placeholder="Tipo"
                            icon="category"
                        />
                    </div>

                    <div className="shrink-0 w-36">
                        <MobileChipSelect
                            options={PRIORIDADES}
                            value={filtroPrioridad}
                            onChange={onPrioridadChange}
                            placeholder="Prioridad"
                            icon="flag"
                        />
                    </div>
                </div>
            </div>

            {/* ── ESCRITORIO ── */}
            <div className="hidden lg:flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3 flex-1">
                    <SearchInput {...searchProps} />

                    <div className="w-44">
                        <SearchableSelect
                            options={TIPOS}
                            value={filtroTipo}
                            onChange={onTipoChange}
                            placeholder="Tipo de tarea…"
                            icon="category"
                            allOptionText="Todos los tipos"
                        />
                    </div>

                    <div className="w-40">
                        <SearchableSelect
                            options={PRIORIDADES}
                            value={filtroPrioridad}
                            onChange={onPrioridadChange}
                            placeholder="Prioridad…"
                            icon="flag"
                            allOptionText="Todas"
                        />
                    </div>
                </div>

                <Button
                    variant={mostrarPapelera ? 'borrar' : 'ghost'}
                    icon={mostrarPapelera ? 'close' : 'delete'}
                    size="sm"
                    onClick={onTogglePapelera}
                    className="h-10 px-4 bg-white"
                >
                    {mostrarPapelera ? 'Ocultar papelera' : 'Papelera'}
                </Button>
            </div>

        </div>
    );
};