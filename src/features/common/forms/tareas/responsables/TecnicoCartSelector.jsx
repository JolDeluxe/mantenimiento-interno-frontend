import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { TecnicoRow } from './TecnicoRow';

export const TecnicoCartSelector = ({
    tecnicos,
    value,
    onChange,
    disabled,
    placeholder = 'Buscar y seleccionar técnico...',
    deferClearSearch = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const tecnicoSeleccionado = useMemo(
        () => tecnicos.find(t => String(t.id) === String(value)),
        [tecnicos, value]
    );

    const tecnicosFiltrados = useMemo(() => {
        const q = busqueda.toLowerCase();
        return tecnicos.filter(t =>
            t.nombre.toLowerCase().includes(q) ||
            (t.cargo ?? '').toLowerCase().includes(q)
        );
    }, [tecnicos, busqueda]);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchRef.current?.focus(), 50);
        } else if (deferClearSearch) {
            queueMicrotask(() => {
                setBusqueda('');
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBusqueda('');
        }
    }, [isOpen, deferClearSearch]);

    const handleSelect = (tecnico) => {
        onChange(String(tecnico.id));
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const wl = tecnicoSeleccionado?.workload;
    const sinTareasSelected = !wl || (wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 border rounded-lg text-sm text-left transition-all',
                    disabled
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isOpen
                            ? 'border-marca-secundario ring-2 ring-marca-secundario/20 bg-white cursor-pointer'
                            : value
                                ? 'border-marca-primario/30 bg-marca-primario/5 cursor-pointer'
                                : 'border-slate-300 bg-white hover:border-slate-400 cursor-pointer'
                )}
            >
                {tecnicoSeleccionado ? (
                    <>
                        {tecnicoSeleccionado.imagen ? (
                            <img
                                src={tecnicoSeleccionado.imagen}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-marca-primario/10 flex items-center justify-center text-[10px] font-black text-marca-primario shrink-0">
                                {tecnicoSeleccionado.nombre?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="text-sm font-bold text-marca-primario truncate">
                                {tecnicoSeleccionado.nombre}
                            </span>
                            {sinTareasSelected ? (
                                <span className="text-[10px] font-bold text-estado-resuelto bg-estado-resuelto/10 px-1.5 py-0.5 rounded-full shrink-0">
                                    Libre
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-estado-pendiente bg-estado-pendiente/10 px-1.5 py-0.5 rounded-full shrink-0">
                                    {(wl.asignadas + wl.enProgreso + wl.enPausa)} tareas
                                </span>
                            )}
                        </div>
                        {!disabled && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleClear(e);
                                    }
                                }}
                                className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-500 transition-colors cursor-pointer"
                            >
                                <Icon name="close" size="xs" />
                            </span>
                        )}
                    </>
                ) : (
                    <>
                        <Icon name="person_search" size="sm" className="text-slate-400 shrink-0" />
                        <span className="flex-1 text-slate-400">{placeholder}</span>
                        <Icon
                            name="expand_more"
                            size="sm"
                            className={cn('text-slate-400 shrink-0 transition-transform', isOpen && 'rotate-180')}
                        />
                    </>
                )}
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <div className="relative">
                            <Icon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o cargo..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {tecnicos.length === 0 ? (
                            <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
                                <Icon name="engineering" size="xl" />
                                <p className="text-sm italic">No hay personal disponible.</p>
                            </div>
                        ) : tecnicosFiltrados.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-400 italic">
                                Sin resultados para "{busqueda}"
                            </div>
                        ) : (
                            tecnicosFiltrados.map(t => (
                                <TecnicoRow
                                    key={t.id}
                                    tecnico={t}
                                    isSelected={String(t.id) === String(value)}
                                    onClick={() => handleSelect(t)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
