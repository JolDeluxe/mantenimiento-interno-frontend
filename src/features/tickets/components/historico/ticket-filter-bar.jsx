import { useState, useEffect } from 'react';
import { Icon, Button, SearchableSelect } from '@/components/ui/z_index';
import { MobileChipSelect } from '@/components/form/z_index';

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
    <div className="relative flex-1 max-w-sm min-w-[200px]">
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
                 focus:border-marca-secundario transition-all placeholder:text-slate-400 h-[38px]"
        />
        {localValue && (
            <button onClick={onClear} className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 cursor-pointer">
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
    conteos = {},
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

    const totalRechazadas = conteos['RECHAZADO'] ?? 0;
    const totalCanceladas = conteos['CANCELADA'] ?? 0;

    const showRechazadasBtn = totalRechazadas > 0 || mostrarRechazadas;
    const showCanceladasBtn = totalCanceladas > 0 || mostrarPapelera;

    return (
        <div className="w-full">
            {/* ── MÓVIL ── */}
            <div className="flex flex-col gap-3 lg:hidden">
                <SearchInput {...searchProps} />
                <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-2 no-scrollbar -mx-1 px-1">
                    {showRechazadasBtn && (
                        <Button
                            variant={mostrarRechazadas ? 'borrar' : 'ghost'}
                            icon={mostrarRechazadas ? 'close' : 'block'}
                            size="sm"
                            onClick={onToggleRechazadas}
                            className="relative overflow-visible shrink-0 w-36 justify-center"
                        >
                            {mostrarRechazadas ? 'Ocultar' : 'Rechazadas'}
                            <span className="absolute -top-2.5 -right-2 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white shadow-sm leading-none">
                                {totalRechazadas}
                            </span>
                        </Button>
                    )}
                    {showCanceladasBtn && (
                        <Button
                            variant={mostrarPapelera ? 'borrar' : 'ghost'}
                            icon={mostrarPapelera ? 'close' : 'delete'}
                            size="sm"
                            onClick={onTogglePapelera}
                            className="shrink-0 w-36 justify-center"
                        >
                            {mostrarPapelera ? 'Ocultar' : 'Canceladas'}
                        </Button>
                    )}
                    <div className="w-36 shrink-0">
                        <MobileChipSelect options={TIPOS} value={filtroTipo} onChange={onTipoChange} placeholder="Tipo" icon="category" />
                    </div>
                    <div className="w-36 shrink-0">
                        <MobileChipSelect options={PRIORIDADES} value={filtroPrioridad} onChange={onPrioridadChange} placeholder="Prioridad" icon="flag" />
                    </div>
                </div>
            </div>

            {/* ── ESCRITORIO (UNIFICADO) ── */}
            <div className="hidden lg:flex items-center gap-3 w-full pt-2">

                {/* 1. Buscador (Ocupa el resto) */}
                <SearchInput {...searchProps} />

                {/* 2. Filtros Select (Ancho Congelado) */}
                <div className="w-44 flex-none">
                    <SearchableSelect options={TIPOS} value={filtroTipo} onChange={onTipoChange} placeholder="Tipo..." icon="category" allOptionText="Todos los tipos" className="w-full" />
                </div>

                <div className="w-40 flex-none">
                    <SearchableSelect options={PRIORIDADES} value={filtroPrioridad} onChange={onPrioridadChange} placeholder="Prioridad..." icon="flag" allOptionText="Todas" className="w-full" />
                </div>

                {/* 3. Botones de Acción (Al final, Ancho Congelado) */}
                <div className="flex items-center gap-3 flex-none">
                    {showRechazadasBtn && (
                        <div className="relative">
                            <Button
                                variant={mostrarRechazadas ? 'borrar' : 'secundario'}
                                icon={mostrarRechazadas ? 'close' : 'block'}
                                size="sm"
                                onClick={onToggleRechazadas}
                                className="w-32 flex-none justify-center h-9.5"
                            >
                                <span className="truncate">{mostrarRechazadas ? 'Rechazadas' : 'Rechazadas'}</span>
                            </Button>
                            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold border-2 border-white shadow-md z-10 pointer-events-none leading-none">
                                {totalRechazadas}
                            </span>
                        </div>
                    )}

                    {showCanceladasBtn && (
                        <Button
                            variant={mostrarPapelera ? 'borrar' : 'secundario'}
                            icon={mostrarPapelera ? 'close' : 'delete'}
                            size="sm"
                            onClick={onTogglePapelera}
                            className="w-36 flex-none justify-center h-9.5"
                        >
                            {mostrarPapelera ? 'Canceladas' : 'Canceladas'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};