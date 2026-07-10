import { useEffect, useState } from 'react';
import { Button, Icon, SearchableSelect } from '@/components/ui/z_index';

const ESTADO_REGLA_OPTIONS = [
    { value: 'true', label: 'Activas' },
    { value: 'false', label: 'Pausadas' },
];

const SearchInput = ({ localValue, onChange, onClear, className = 'w-full' }) => (
    <div className={`relative ${className}`}>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-400" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Buscar regla, maquina o responsable"
            className="h-[38px] w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:border-marca-secundario focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
        />
        {localValue && (
            <button
                type="button"
                onClick={onClear}
                className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 hover:text-slate-600"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const RecurrentesToolbar = ({
    query,
    onQueryChange,
    activo,
    onActivoChange,
    onRefresh,
    onCreate,
    canManage,
    loading,
}) => {
    const [localValue, setLocalValue] = useState(query || '');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalValue(query || '');
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== query) onQueryChange(localValue);
        }, 450);
        return () => clearTimeout(timer);
    }, [localValue, onQueryChange, query]);

    return (
        <div className="flex w-full flex-col gap-3 pt-1">
            <div className="flex w-full items-center gap-3">
                <SearchInput
                    localValue={localValue}
                    onChange={setLocalValue}
                    onClear={() => setLocalValue('')}
                    className="min-w-[180px] max-w-md flex-1"
                />
                <div className="ml-auto flex flex-none items-center gap-3">
                    <Button
                        type="button"
                        variant="filtro_gris"
                        icon="refresh"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-[38px]"
                    >
                        Actualizar
                    </Button>
                    {canManage && (
                        <Button type="button" variant="primario" icon="add" size="sm" onClick={onCreate} className="h-[38px]">
                            Nueva regla
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3">
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={ESTADO_REGLA_OPTIONS}
                        value={activo}
                        onChange={onActivoChange}
                        placeholder="Estado regla..."
                        icon="settings"
                        allOptionText="Todas"
                        className="w-full"
                    />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Icon name="event_repeat" size="16px" className="text-marca-primario" />
                    Reglas preventivas por maquina. No son tickets; generan ciclos.
                </div>
            </div>
        </div>
    );
};
