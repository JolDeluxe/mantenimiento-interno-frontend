import { useEffect, useState } from 'react';
import { Button, Icon, SearchableSelect } from '@/components/ui/z_index';

const ESTADO_REGLA_OPTIONS = [
    { value: 'false', label: 'Pausadas' },
    { value: 'all', label: 'Todas' },
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
            placeholder="Buscar programacion, maquina o responsable"
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
    mostrarBajaDesuso,
    onToggleBajaDesuso,
    onRefresh,
    onCreate,
    canManage,
    loading,
}) => {
    const [localValue, setLocalValue] = useState(query || '');
    const estadoValue = activo === 'true' ? '' : (activo || 'all');

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
                    {canManage && (
                        <Button type="button" variant="accion" icon="add" size="sm" onClick={onCreate} className="h-9.5">
                            Agregar preventivo recurrente
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-3">
                <div className="min-w-40 flex-none">
                    <SearchableSelect
                        options={ESTADO_REGLA_OPTIONS}
                        value={estadoValue}
                        onChange={(value) => onActivoChange(value === 'all' ? '' : value || 'true')}
                        placeholder="Activas"
                        icon="settings"
                        allOptionText="Activas"
                        className="w-full"
                    />
                </div>
                <Button
                    type="button"
                    variant="filtro_gris"
                    icon={mostrarBajaDesuso ? 'close' : 'hide_source'}
                    size="sm"
                    onClick={onToggleBajaDesuso}
                    className={`h-9.5 ${mostrarBajaDesuso ? 'bg-slate-700 text-white hover:bg-slate-800' : ''}`}
                >
                    Mostrar baja/desuso
                </Button>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Icon name="event_repeat" size="16px" className="text-marca-primario" />
                    Programaciones preventivas por maquina. El sistema genera mantenimientos del periodo mensual.
                </div>
            </div>
        </div>
    );
};
