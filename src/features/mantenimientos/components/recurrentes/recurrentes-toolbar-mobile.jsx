import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';

const ESTADO_OPTIONS = [
    { value: 'true', label: 'Activas' },
    { value: 'false', label: 'Pausadas' },
];

const GlassNativeSelect = ({ icon, placeholder, options, value, onChange }) => {
    const selected = options.find((option) => option.value === String(value));
    const isActive = Boolean(value);

    return (
        <div className="relative h-9.5 w-full">
            <select
                value={value ? String(value) : ''}
                onChange={(event) => onChange(event.target.value)}
                className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none opacity-0"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            <div
                style={isActive ? { ...glassBase('primary'), borderRadius: 12 } : { ...glassBase('light'), borderRadius: 12 }}
                className={`absolute inset-0 flex items-center gap-1.5 overflow-hidden px-3 py-2 text-xs font-bold transition-all ${isActive ? 'text-white' : 'text-slate-600'}`}
            >
                <GlassSheen />
                <Icon name={icon} size="xs" className="relative z-10 shrink-0" />
                <span className="relative z-10 flex-1 truncate">{selected?.label ?? placeholder}</span>
                <Icon name="expand_more" size="xs" className="relative z-10 shrink-0" />
            </div>
        </div>
    );
};

const SearchInput = ({ localValue, onChange, onClear }) => (
    <div className="relative flex min-w-[90px] flex-1 items-center overflow-hidden" style={{ ...glassBase('light'), borderRadius: 14 }}>
        <GlassSheen />
        <div className="absolute inset-y-0 left-2.5 z-10 flex items-center pointer-events-none">
            <Icon name="search" size="sm" className="text-slate-500" />
        </div>
        <input
            type="text"
            value={localValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Buscar..."
            className="relative z-10 h-9.5 w-full rounded-[14px] bg-transparent py-2.5 pl-8 pr-7 text-xs text-slate-700 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-marca-secundario/30"
        />
        {localValue && (
            <button
                type="button"
                onClick={onClear}
                className="absolute inset-y-0 right-1.5 z-10 flex items-center px-2 text-slate-500 active:scale-90"
            >
                <Icon name="close" size="xs" />
            </button>
        )}
    </div>
);

export const RecurrentesToolbarMobile = ({
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
    const [showFilters, setShowFilters] = useState(false);

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

    const hasFilters = Boolean(activo);

    return (
        <div className="flex w-full flex-col gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-hidden">
                <SearchInput localValue={localValue} onChange={setLocalValue} onClear={() => setLocalValue('')} />
                <button
                    type="button"
                    onClick={() => setShowFilters((prev) => !prev)}
                    style={showFilters || hasFilters ? { ...glassBase('primary'), borderRadius: 14 } : { ...glassBase('light'), borderRadius: 14 }}
                    className={`relative h-[38px] w-[38px] shrink-0 overflow-hidden transition-all active:scale-95 ${showFilters || hasFilters ? 'text-white' : 'text-slate-600'}`}
                >
                    <GlassSheen />
                    <Icon name="filter_alt" size="sm" className="relative z-10" />
                    {hasFilters && !showFilters && <span className="absolute right-0 top-0 z-20 h-2.5 w-2.5 rounded-full border-2 border-white bg-marca-acento" />}
                </button>
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={loading}
                    style={{ ...glassBase('light'), borderRadius: 14 }}
                    className="relative h-[38px] w-[38px] shrink-0 overflow-hidden text-slate-600 transition-all active:scale-95 disabled:opacity-50"
                >
                    <GlassSheen />
                    <Icon name="refresh" size="sm" className="relative z-10" />
                </button>
                {canManage && (
                    <button
                        type="button"
                        onClick={onCreate}
                        style={{ ...glassBase('primary'), borderRadius: 14 }}
                        className="relative h-[38px] w-[38px] shrink-0 overflow-hidden text-white transition-all active:scale-95"
                    >
                        <GlassSheen />
                        <Icon name="add" size="sm" className="relative z-10" />
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="relative overflow-hidden rounded-[20px] p-3 animate-in fade-in slide-in-from-top-2" style={glassBase('light')}>
                    <GlassSheen />
                    <div className="relative z-10 grid grid-cols-1 gap-2">
                        <GlassNativeSelect
                            icon="settings"
                            placeholder="Estado regla"
                            options={ESTADO_OPTIONS}
                            value={activo}
                            onChange={onActivoChange}
                        />
                        <button
                            type="button"
                            disabled={!hasFilters}
                            onClick={() => onActivoChange('')}
                            className={`justify-self-end px-3 py-1.5 text-xs font-bold ${hasFilters ? 'text-red-500' : 'text-slate-400'}`}
                        >
                            <Icon name="filter_alt_off" size="xs" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
