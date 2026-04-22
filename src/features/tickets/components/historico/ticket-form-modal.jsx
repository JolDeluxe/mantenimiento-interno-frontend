// src/features/tickets/components/historico/ticket-form-modal.jsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput } from '@/lib/date';
import { Label, Input, Select } from '@/components/form/z_index';
import { cn } from '@/utils/cn';
import {
    PLANTAS, CLASIFICACIONES_CLIENTE, CLASIFICACIONES_ADMIN,
    PRIORIDADES, TIPOS_ADMIN, ROLES_ADMIN, AREAS_POR_PLANTA, AREAS, CATEGORIAS_EQUIPO
} from '../../constants';

const MAX_TITULO = 80;
const MAX_DESCRIPCION = 500;

const HORAS_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DurationPicker = ({ valueMins, onChange, disabled, error }) => {
    const horas = Math.floor((valueMins || 0) / 60);
    const minutos = Math.round(((valueMins || 0) % 60) / 5) * 5 % 60;
    const totalLabel = valueMins > 0 ? `${valueMins} min en total` : null;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">

                    <select
                        value={horas}
                        onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)}
                        disabled={disabled}
                        className={cn(
                            "w-full border rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8 transition-colors",
                            error
                                ? "border-rose-500 focus:ring-rose-200"
                                : "border-slate-300 focus:ring-marca-secundario/30"
                        )}
                    >
                        {HORAS_OPTIONS.map(h => <option key={h} value={h}>{h} h</option>)}
                    </select>
                    <div className={cn(
                        "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2",
                        error ? "text-rose-400" : "text-slate-400"
                    )}>
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>

                <div className="relative">
                    <select
                        value={minutos}
                        onChange={(e) => onChange(horas * 60 + Number(e.target.value))}
                        disabled={disabled}
                        className={cn(
                            "w-full border rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8 transition-colors",
                            error
                                ? "border-rose-500 focus:ring-rose-200"
                                : "border-slate-300 focus:ring-marca-secundario/30"
                        )}
                    >
                        {MINUTOS_OPTIONS.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>)}
                    </select>
                    <div className={cn(
                        "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2",
                        error ? "text-rose-400" : "text-slate-400"
                    )}>
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
            </div>

            {totalLabel && (
                <p className={cn(
                    "text-[11px] flex items-center gap-1 transition-colors",
                    error ? "text-rose-600 font-bold" : "text-slate-400"
                )}>
                    <Icon name="timer" size="xs" /> {totalLabel}
                </p>
            )}
        </div>
    );
};

const WorkloadBadge = ({ label, count, colorClass }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        {label} <span>{count}</span>
    </span>
);

const TecnicoRow = ({ tecnico, isSelected, onClick }) => {
    const wl = tecnico.workload || { asignadas: 0, enProgreso: 0, enPausa: 0 };
    const sinTareas = wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0;
    const totalTareas = wl.asignadas + wl.enProgreso + wl.enPausa;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-50 last:border-0 cursor-pointer',
                isSelected
                    ? 'bg-marca-primario/8 hover:bg-marca-primario/10'
                    : 'bg-white hover:bg-slate-50'
            )}
        >
            {tecnico.imagen ? (
                <img
                    src={tecnico.imagen}
                    alt={tecnico.nombre}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                />
            ) : (
                <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0',
                    isSelected ? 'bg-marca-primario text-white' : 'bg-marca-primario/10 text-marca-primario'
                )}>
                    {tecnico.nombre?.charAt(0).toUpperCase() ?? '?'}
                </div>
            )}

            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        'text-sm font-bold truncate',
                        isSelected ? 'text-marca-primario' : 'text-slate-800'
                    )}>
                        {tecnico.nombre}
                    </span>
                    {sinTareas ? (
                        <span className="text-[10px] font-bold text-estado-resuelto bg-estado-resuelto/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Sin Tareas
                        </span>
                    ) : (
                        <span className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                            totalTareas >= 5
                                ? 'bg-estado-rechazado/10 text-estado-rechazado'
                                : totalTareas >= 3
                                    ? 'bg-prioridad-alta/10 text-prioridad-alta'
                                    : 'bg-estado-pendiente/10 text-estado-pendiente'
                        )}>
                            {totalTareas} tarea{totalTareas !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    {tecnico.cargo && (
                        <span className="text-[10px] text-slate-400 truncate">{tecnico.cargo}</span>
                    )}
                    {!sinTareas && (
                        <>
                            {tecnico.cargo && <span className="text-[10px] text-slate-300">·</span>}
                            {wl.asignadas > 0 && (
                                <WorkloadBadge label="Asig." count={wl.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />
                            )}
                            {wl.enProgreso > 0 && (
                                <WorkloadBadge label="Prog." count={wl.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />
                            )}
                            {wl.enPausa > 0 && (
                                <WorkloadBadge label="Pausa" count={wl.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={cn(
                'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'
            )}>
                {isSelected && <Icon name="check" size="xs" className="text-white" />}
            </div>
        </button>
    );
};

const TecnicoCartSelector = ({ tecnicos, value, onChange, disabled, placeholder = 'Buscar y seleccionar técnico...' }) => {
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
        } else {
            setBusqueda('');
        }
    }, [isOpen]);

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
                            <button
                                type="button"
                                onClick={handleClear}
                                className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-500 transition-colors"
                            >
                                <Icon name="close" size="xs" />
                            </button>
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

const TecnicoChip = ({ tecnico, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full text-xs font-bold bg-marca-primario/10 text-marca-primario border border-marca-primario/20">
        {tecnico?.imagen ? (
            <img src={tecnico.imagen} alt={tecnico?.nombre} className="w-5 h-5 rounded-full object-cover" />
        ) : (
            <div className="w-5 h-5 rounded-full bg-marca-primario/20 flex items-center justify-center text-[10px]">
                {tecnico?.nombre?.charAt(0)}
            </div>
        )}
        <span className="pl-1 truncate max-w-[120px]">{tecnico?.nombre}</span>
        <button type="button" onClick={onRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/20 hover:bg-marca-primario/40 transition-colors cursor-pointer shrink-0">
            <Icon name="close" size="xs" />
        </button>
    </span>
);

const TecnicoDropdown = ({ opciones, onAdd, disabled, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false); onToggle?.(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onToggle]);

    const toggle = () => {
        if (disabled) return;
        const next = !isOpen;
        setIsOpen(next);
        onToggle?.(next);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={toggle} className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors",
                disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-slate-300 hover:border-marca-primario text-slate-700 cursor-pointer"
            )}>
                <div className="flex items-center gap-2">
                    <Icon name="engineering" size="sm" className={disabled ? "text-slate-400" : "text-slate-500"} />
                    <span>Añadir técnico...</span>
                </div>
                <Icon name={isOpen ? "expand_less" : "expand_more"} size="sm" />
            </div>
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {opciones.length === 0 ? (
                        <div className="p-3 text-sm text-center text-slate-500">No hay más técnicos disponibles</div>
                    ) : (
                        opciones.map(opt => {
                            const t = opt.tecnico;
                            const wl = t.workload || { asignadas: 0, enProgreso: 0, enPausa: 0 };
                            const sinTareas = wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0;
                            return (
                                <button key={opt.value} type="button"
                                    onClick={() => { onAdd(opt.value); setIsOpen(false); onToggle?.(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-100 last:border-0">
                                    {t.imagen ? (
                                        <img src={t.imagen} alt={t.nombre}
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }} />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-marca-primario/10 flex items-center justify-center text-xs font-bold text-marca-primario shrink-0">
                                            {t.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-slate-800 truncate">{t.nombre}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {t.cargo && <span className="text-[10px] text-slate-400 truncate">{t.cargo}</span>}
                                            {sinTareas ? (
                                                <span className="text-[10px] text-estado-resuelto italic">Sin tareas</span>
                                            ) : (
                                                <>
                                                    {wl.asignadas > 0 && <WorkloadBadge label="Asig." count={wl.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />}
                                                    {wl.enProgreso > 0 && <WorkloadBadge label="Prog." count={wl.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />}
                                                    {wl.enPausa > 0 && <WorkloadBadge label="Pausa" count={wl.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

const TecnicoAdicionalChip = ({ nombre, onRemove }) => (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {nombre}
        <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
        >
            <Icon name="close" size="xs" />
        </button>
    </span>
);

const PRIORIDAD_DOT = {
    BAJA: 'bg-prioridad-baja',
    MEDIA: 'bg-prioridad-media',
    ALTA: 'bg-prioridad-alta',
    CRITICA: 'bg-prioridad-critica',
};

const CarritoItem = ({ item, index, onRemove, tecnicoMap, tecnicos, onAddTecnico, onRemoveTecnico }) => {
    const [expanded, setExpanded] = useState(false);
    const clasificLabel = CLASIFICACIONES_ADMIN.find(c => c.value === item.clasificacion)?.label || item.clasificacion;
    const tipoLabel = TIPOS_ADMIN.find(t => t.value === item.tipo)?.label || item.tipo;
    const dotColor = PRIORIDAD_DOT[item.prioridad] || 'bg-slate-300';

    const tecnicosIds = item.responsables || [];
    const opcionesAdicionales = tecnicos.filter(t => !tecnicosIds.includes(String(t.id)));

    return (
        <div className={cn(
            "rounded-xl border transition-all duration-200 overflow-hidden",
            expanded ? 'border-marca-primario/25 bg-white shadow-sm' : 'border-slate-200 bg-white'
        )}>
            <div className="flex items-start gap-2.5 px-3 py-2.5">
                <span className="w-6 h-6 rounded-full bg-marca-primario/10 text-marca-primario text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} title={item.prioridad} />
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{item.titulo}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{clasificLabel}</span>
                        <span className="text-slate-300 text-[10px]">·</span>
                        <span className="text-[10px] text-slate-400">{item.planta}{item.area ? ` / ${item.area}` : ''}</span>
                        {tipoLabel && (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-slate-400">{tipoLabel}</span>
                            </>
                        )}
                        {item.fechaVencimiento && (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-estado-asignada font-bold">{item.fechaVencimiento}</span>
                            </>
                        )}
                    </div>

                    {!expanded && tecnicosIds.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Icon name="engineering" size="xs" className="text-slate-300 shrink-0" />
                            {tecnicosIds.slice(0, 3).map(id => {
                                const t = tecnicoMap?.[id];
                                return (
                                    <span key={id} className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-medium truncate max-w-[80px]">
                                        {t?.nombre ?? `#${id}`}
                                    </span>
                                );
                            })}
                            {tecnicosIds.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{tecnicosIds.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => setExpanded(!expanded)}
                        title={expanded ? 'Ocultar detalles' : 'Administrar tarea'}
                        className={cn(
                            "p-1.5 rounded-md transition-colors",
                            expanded ? 'bg-marca-primario/10 text-marca-primario' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        )}>
                        <Icon name={expanded ? 'expand_less' : 'expand_more'} size="xs" />
                    </button>
                    <button type="button" onClick={() => onRemove(item._id)} title="Quitar tarea"
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Icon name="close" size="xs" />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="px-3 pb-3 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                    {item.descripcion && item.descripcion !== 'Sin descripción.' && (
                        <p className="text-xs text-slate-600 leading-relaxed px-1">{item.descripcion}</p>
                    )}

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5 px-1">
                            <Icon name="group_add" size="xs" className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Técnicos de esta tarea</span>
                        </div>

                        {tecnicosIds.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 px-1">
                                {tecnicosIds.map(id => {
                                    const t = tecnicoMap[id];
                                    return (
                                        <TecnicoAdicionalChip
                                            key={id}
                                            nombre={t?.nombre ?? `#${id}`}
                                            onRemove={() => onRemoveTecnico(item._id, id)}
                                        />
                                    );
                                })}
                            </div>
                        )}

                        {opcionesAdicionales.length > 0 ? (
                            <div className="relative mt-1">
                                <select
                                    value=""
                                    onChange={(e) => { if (e.target.value) onAddTecnico(item._id, e.target.value); }}
                                    className="w-full border border-slate-200 rounded text-xs px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-marca-secundario cursor-pointer appearance-none"
                                >
                                    <option value="">+ Asignar técnico a esta tarea...</option>
                                    {opcionesAdicionales.map(t => (
                                        <option key={t.id} value={String(t.id)}>
                                            {t.nombre} {t.cargo ? `- ${t.cargo}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
                                    <Icon name="expand_more" size="xs" />
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 italic px-1">No hay más técnicos disponibles para asignar.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const TicketFormModal = ({
    isOpen, onClose, onSuccess,
    ticketAEditar, currentUser, tecnicos = [], isSubmitting,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);
    const modoCarrito = !esEdicion && esAdmin;

    const isSameDepartment = currentUser?.departamentoId === ticketAEditar?.departamentoId;
    const isJefeOwner = currentUser?.rol === 'JEFE_MTTO' && isSameDepartment;
    const isCoordinador = currentUser?.rol === 'COORDINADOR';
    const isTicket = esEdicion ? ticketAEditar?.tipo === 'TICKET' : false;
    const lockBaseFields = esEdicion && isTicket && !isJefeOwner && !isCoordinador;

    const [carrito, setCarrito] = useState([]);
    const [tecnicoCartId, setTecnicoCartId] = useState('');

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);

    const [responsables, setResponsables] = useState([]);

    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const esRutina = clasificacion === 'RUTINA';
    const carritoLocked = carrito.length > 0;
    const tecnicoCart = tecnicos.find(t => String(t.id) === tecnicoCartId);

    const opcionesTecnicos = useMemo(() =>
        tecnicos.map(t => ({ value: String(t.id), tecnico: t })), [tecnicos]);

    const tecnicoMapEdit = useMemo(() =>
        Object.fromEntries(tecnicos.map(t => [String(t.id), t])), [tecnicos]);

    const opcionesDisponiblesEdit = useMemo(() =>
        opcionesTecnicos.filter(opt => !responsables.includes(opt.value)),
        [opcionesTecnicos, responsables]);

    const tecnicoMapCompleto = useMemo(() =>
        Object.fromEntries(tecnicos.map(t => [String(t.id), t])),
        [tecnicos]
    );

    const hoyLocal = getMinDateHoy();
    const mananaLocal = isoToDateInput(Date.now() + 86400000);

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');
        setIsDropdownOpen(false);
        setCarrito([]);
        setTecnicoCartId('');

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setClasificacion(ticketAEditar.clasificacion ?? '');
            setTipo(ticketAEditar.tipo ?? 'PLANEADA');
            setFechaVencimiento(isoToDateInput(ticketAEditar.fechaVencimiento));
            setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? 0);
            setResponsables(ticketAEditar.responsables?.map(r => String(r.id)) ?? []);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria('');
            setPlanta(''); setArea(''); setPrioridad('');
            setClasificacion(''); setTipo(''); setFechaVencimiento('');
            setTiempoEstimadoMins(0); setResponsables([]);
        }
    }, [isOpen, esEdicion, ticketAEditar]);

    const getErrors = () => {
        const e = {};
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (!descripcion.trim() || descripcion.length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!clasificacion) e.clasificacion = 'Selecciona la clasificación.';
        if (!prioridad) e.prioridad = 'Selecciona la prioridad.';
        if (!planta) e.planta = 'Selecciona la planta.';
        if (!area) e.area = 'Selecciona el área.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';

        if (esAdmin) {
            if (!tipo) e.tipo = 'El tipo de tarea es obligatorio.';

            // Validación: Fecha de vencimiento obligatoria
            if (!fechaVencimiento) {
                e.fechaVencimiento = 'La fecha de vencimiento es obligatoria.';
            } else if (fechaVencimiento < hoyLocal) {
                const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
                if (!esEdicion || fechaVencimiento !== fechaOriginal)
                    e.fechaVencimiento = 'No se permiten fechas anteriores a hoy.';
            }

            // Validación: Tiempo estimado obligatorio (si no es rutina)
            if (!esRutina && tiempoEstimadoMins <= 0) {
                e.tiempoEstimado = 'El tiempo estimado es obligatorio.';
            }

            // Validación: Responsables obligatorios
            if (esEdicion) {
                if (responsables.length === 0) e.responsables = 'Asigna al menos un técnico.';
            } else {
                // En modo creación/carrito, verificamos el técnico principal seleccionado
                if (!tecnicoCartId) e.responsables = 'Debes seleccionar un técnico principal.';
            }
        }
        return e;
    };

    const resetFormFields = () => {
        setTitulo(''); setDescripcion(''); setCategoria('');
        setPlanta(''); setArea(''); setPrioridad('');
        setClasificacion(''); setTipo(''); setFechaVencimiento('');
        setTiempoEstimadoMins(0); setSubmitted(false);
        setIsDropdownOpen(false);
    };

    const handleAgregarAlCarrito = () => {
        setSubmitted(true);
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        setCarrito(prev => [...prev, {
            _id: `${Date.now()}-${Math.random()}`,
            titulo, descripcion, categoria, planta, area,
            prioridad, clasificacion, tipo, fechaVencimiento,
            tiempoEstimadoMins, esRutina,
            responsables: tecnicoCartId ? [tecnicoCartId] : [],
        }]);
        resetFormFields();
    };

    const handleQuitarDelCarrito = (_id) => {
        setCarrito(prev => prev.filter(item => item._id !== _id));
    };

    const handleAgregarTecnicoItem = (itemId, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === itemId
                ? { ...item, responsables: [...new Set([...item.responsables, techId])] }
                : item
        ));
    };

    const handleQuitarTecnicoItem = (itemId, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === itemId
                ? { ...item, responsables: item.responsables.filter(id => id !== techId) }
                : item
        ));
    };

    const buildFormData = (item) => {
        const fd = new FormData();
        fd.append('titulo', item.titulo);
        fd.append('descripcion', item.descripcion);
        fd.append('clasificacion', item.clasificacion);
        if (item.categoria) fd.append('categoria', item.categoria);
        fd.append('planta', item.planta);
        fd.append('area', item.area);
        fd.append('prioridad', item.prioridad);
        if (esAdmin) {
            fd.append('tipo', item.tipo);
            if (item.fechaVencimiento) fd.append('fechaVencimiento', fechaInputToISOLocal(item.fechaVencimiento));
            if (!item.esRutina && item.tiempoEstimadoMins > 0)
                fd.append('tiempoEstimado', String(item.tiempoEstimadoMins));
            item.responsables.forEach(id => fd.append('responsables', id));
        }
        return fd;
    };

    const handleAddTecnicoEdit = (idStr) => {
        if (!idStr || responsables.includes(idStr)) return;
        setResponsables(prev => [...prev, idStr]);
    };
    const handleRemoveTecnicoEdit = (idStr) => {
        setResponsables(prev => prev.filter(x => x !== idStr));
    };

    const handleSubmit = async () => {
        setBackendError('');

        if (esEdicion) {
            setSubmitted(true);
            const errors = getErrors();
            if (Object.keys(errors).length > 0) return;

            const fd = new FormData();
            fd.append('titulo', titulo);
            fd.append('descripcion', descripcion);
            fd.append('clasificacion', clasificacion);
            if (categoria) fd.append('categoria', categoria);
            fd.append('planta', planta);
            fd.append('area', area);
            fd.append('prioridad', prioridad);
            if (esAdmin) {
                fd.append('tipo', tipo);
                if (fechaVencimiento) fd.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));
                if (!esRutina && tiempoEstimadoMins > 0)
                    fd.append('tiempoEstimado', String(tiempoEstimadoMins));
                responsables.forEach(id => fd.append('responsables', id));
            }
            try {
                await onSuccess(fd);
            } catch (err) {
                const data = err?.response?.data;
                let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
                if (Array.isArray(data?.errors)) msg = data.errors[0].message;
                setBackendError(msg);
            }
            return;
        }

        if (carrito.length === 0) {
            setBackendError('Agrega al menos una tarea antes de guardar.');
            return;
        }
        try {
            await onSuccess(carrito.map(buildFormData));
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (Array.isArray(data?.errors)) msg = data.errors[0].message;
            setBackendError(msg);
        }
    };

    const setToday = () => setFechaVencimiento(hoyLocal);
    const setTomorrow = () => setFechaVencimiento(mananaLocal);

    const isHoy = fechaVencimiento === hoyLocal;
    const isManana = fechaVencimiento === mananaLocal;

    const fe = submitted ? getErrors() : {};
    const clasificacionesOpts = esAdmin ? CLASIFICACIONES_ADMIN : CLASIFICACIONES_CLIENTE;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={cn("w-full", modoCarrito ? "md:max-w-5xl xl:max-w-6xl" : "md:max-w-4xl lg:max-w-5xl")}
        >
            <ModalHeader title={esEdicion ? 'Editar tarea' : esAdmin ? 'Nueva tarea' : 'Reportar problema'} onClose={onClose} />

            <ModalBody>
                <div className={cn("flex gap-6", modoCarrito ? "flex-col lg:flex-row" : "flex-col")}>

                    {/* ── PANEL IZQUIERDO: Formulario ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                        {backendError && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                                <Icon name="error" size="sm" /> {backendError}
                            </div>
                        )}

                        {esAdmin && tecnicos.length > 0 && (
                            modoCarrito ? (
                                <div className={cn(
                                    "p-3.5 rounded-xl border flex flex-col gap-3 transition-colors",
                                    fe.responsables ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon name="engineering" size="sm" className={fe.responsables ? "text-rose-500" : "text-slate-500"} />
                                            <span className={cn("text-sm font-bold", fe.responsables ? "text-rose-700" : "text-slate-700")}>
                                                Técnico principal *
                                            </span>
                                        </div>
                                        {carritoLocked && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                <Icon name="lock" size="xs" /> Bloqueado para este tecnico
                                            </span>
                                        )}
                                    </div>

                                    <TecnicoCartSelector
                                        tecnicos={tecnicos}
                                        value={tecnicoCartId}
                                        onChange={(val) => { if (!carritoLocked) setTecnicoCartId(val); }}
                                        disabled={isSubmitting || carritoLocked}
                                        placeholder="Buscar y seleccionar técnico..."
                                    />
                                    {fe.responsables && <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1"><Icon name="error" size="xs" /> {fe.responsables}</p>}

                                    {tecnicoCart && (() => {
                                        const wl = tecnicoCart.workload;
                                        const sinTareas = !wl || (wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0);
                                        return (
                                            <div className={cn(
                                                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                                                sinTareas
                                                    ? 'bg-estado-resuelto/5 border-estado-resuelto/20 text-estado-resuelto'
                                                    : 'bg-slate-100 border-slate-200 text-slate-600'
                                            )}>
                                                <Icon name={sinTareas ? 'check_circle' : 'assignment'} size="xs" className="shrink-0" />
                                                {sinTareas ? (
                                                    <span><strong>{tecnicoCart.nombre}</strong> no tiene tareas activas — ideal para asignar.</span>
                                                ) : (
                                                    <span>
                                                        <strong>{tecnicoCart.nombre}</strong> tiene {(wl.asignadas + wl.enProgreso + wl.enPausa)} tarea(s) activa(s).
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className={cn("flex flex-col gap-2 transition-[padding] duration-300", isDropdownOpen ? "pb-[260px]" : "pb-0")}>
                                    <Label error={!!fe.responsables}>Técnicos asignados *</Label>
                                    <TecnicoDropdown
                                        opciones={opcionesDisponiblesEdit}
                                        onAdd={handleAddTecnicoEdit}
                                        disabled={isSubmitting || opcionesDisponiblesEdit.length === 0}
                                        onToggle={setIsDropdownOpen}
                                    />
                                    {fe.responsables && <p className="text-[10px] text-rose-600 font-bold mt-1">{fe.responsables}</p>}
                                    {responsables.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-12">
                                            {responsables.map(id => (
                                                <TecnicoChip key={id} tecnico={tecnicoMapEdit[id]} onRemove={() => handleRemoveTecnicoEdit(id)} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-xs italic min-h-12">
                                            <Icon name="engineering" size="sm" /> Sin técnicos asignados
                                        </div>
                                    )}
                                </div>
                            )
                        )}

                        {/* ── TÍTULO ── */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tf-titulo" error={!!fe.titulo}>Título *</Label>
                                <span className={`text-[10px] font-bold ${titulo.length >= MAX_TITULO ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                    {titulo.length}/{MAX_TITULO}
                                </span>
                            </div>
                            <Input id="tf-titulo" value={titulo}
                                onChange={(e) => setTitulo(e.target.value.slice(0, MAX_TITULO))}
                                error={!!fe.titulo} helperText={fe.titulo}
                                placeholder="Ej. Fuga de aire en compresor principal"
                                disabled={isSubmitting || lockBaseFields} />
                        </div>

                        {/* ── FILA 1: Clasificación | Prioridad | Categoría | Tipo ── */}
                        <div className={cn("grid gap-3", esAdmin ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3")}>

                            {esAdmin && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tf-tipo" error={!!fe.tipo}>Tipo de tarea *</Label>
                                    <Select id="tf-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
                                        error={!!fe.tipo} helperText={fe.tipo}
                                        disabled={isSubmitting || lockBaseFields}>
                                        <option value="" disabled hidden>Selecciona…</option>
                                        {isTicket && <option value="TICKET">Ticket</option>}
                                        {TIPOS_ADMIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Select>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-clas" error={!!fe.clasificacion}>Clasificación *</Label>
                                <Select
                                    id="tf-clas"
                                    value={clasificacion}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setClasificacion(val);
                                        // Lógica de automatización: Si es Inspección, forzar Categoría a Rutina
                                        if (val === 'INSPECCION') {
                                            setCategoria('SERVICIOS_RUTINAS');
                                        }
                                    }}
                                    error={!!fe.clasificacion}
                                    helperText={fe.clasificacion}
                                    disabled={isSubmitting}
                                >
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {clasificacionesOpts.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-pri" error={!!fe.prioridad}>Prioridad *</Label>
                                <Select id="tf-pri" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}
                                    error={!!fe.prioridad} helperText={fe.prioridad} disabled={isSubmitting}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría del equipo *</Label>
                                <Select id="tf-cat" value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                    error={!!fe.categoria} helperText={fe.categoria} disabled={isSubmitting || lockBaseFields}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {CATEGORIAS_EQUIPO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Select>
                            </div>
                            {/* {esAdmin && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tf-tipo" error={!!fe.tipo}>Tipo de tarea *</Label>
                                    <Select id="tf-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
                                        error={!!fe.tipo} helperText={fe.tipo}
                                        disabled={isSubmitting || lockBaseFields}>
                                        <option value="" disabled hidden>Selecciona…</option>
                                        {isTicket && <option value="TICKET">Ticket</option>}
                                        {TIPOS_ADMIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Select>
                                </div>
                            )} */}
                        </div>

                        {/* ── FILA 2: Planta | Área ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-planta" error={!!fe.planta}>Planta *</Label>
                                <Select id="tf-planta" value={planta} onChange={(e) => {
                                    const val = e.target.value;
                                    setPlanta(val);
                                    const posibles = AREAS_POR_PLANTA[val] || AREAS;
                                    setArea(posibles.length === 1 ? posibles[0] : '');
                                }} error={!!fe.planta} helperText={fe.planta} disabled={isSubmitting || lockBaseFields}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {PLANTAS.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-area" error={!!fe.area}>Área / Línea *</Label>
                                <Select id="tf-area" value={area} onChange={(e) => setArea(e.target.value)}
                                    error={!!fe.area} helperText={fe.area} disabled={isSubmitting || lockBaseFields}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {(planta && AREAS_POR_PLANTA[planta] ? AREAS_POR_PLANTA[planta] : AREAS).map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* ── FILA 3: Fecha vencimiento | Tiempo estimado ── */}
                        {esAdmin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="tf-fecha" error={!!fe.fechaVencimiento}>Fecha vencimiento *</Label>
                                        <div className="flex items-center gap-1.5">
                                            <button type="button" onClick={setToday} disabled={isSubmitting}
                                                className={cn("text-xs font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                                    isHoy ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20")}>
                                                Hoy
                                            </button>
                                            <button type="button" onClick={setTomorrow} disabled={isSubmitting}
                                                className={cn("text-xs font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                                    isManana ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20")}>
                                                Mañana
                                            </button>
                                        </div>
                                    </div>
                                    <Input id="tf-fecha" type="date" value={fechaVencimiento} min={hoyLocal}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setFechaVencimiento(v && v < hoyLocal ? hoyLocal : v);
                                        }}
                                        error={!!fe.fechaVencimiento} helperText={fe.fechaVencimiento}
                                        disabled={isSubmitting} style={{ minWidth: 0 }} />
                                </div>
                                {!esRutina && (
                                    <div className="flex flex-col gap-1.5">
                                        <Label error={!!fe.tiempoEstimado}>Tiempo estimado *</Label>
                                        <DurationPicker valueMins={tiempoEstimadoMins} onChange={setTiempoEstimadoMins} disabled={isSubmitting} />
                                        {fe.tiempoEstimado && <p className="text-[10px] text-rose-600 font-bold">{fe.tiempoEstimado}</p>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── DESCRIPCIÓN ── */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tf-desc" error={!!fe.descripcion}>Descripción *</Label>
                                <div className="flex items-center gap-2">
                                    {!descripcion && (
                                        <button
                                            type="button"
                                            onClick={() => setDescripcion('Sin descripción.')}
                                            disabled={isSubmitting || lockBaseFields}
                                            className="text-[10px] font-bold text-slate-400 hover:text-marca-primario bg-slate-100 hover:bg-marca-primario/10 px-2 py-0.5 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Sin descripción
                                        </button>
                                    )}
                                    <span className={`text-[10px] font-bold ${descripcion.length >= MAX_DESCRIPCION ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                        {descripcion.length}/{MAX_DESCRIPCION}
                                    </span>
                                </div>
                            </div>
                            <Input id="tf-desc" multiline rows={modoCarrito ? 3 : 4} value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
                                error={!!fe.descripcion} helperText={fe.descripcion}
                                placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                disabled={isSubmitting || lockBaseFields} />
                        </div>

                        {modoCarrito && (
                            <div className="flex items-center gap-3 pt-1">
                                <Button variant="accion" icon="add_circle" onClick={handleAgregarAlCarrito} disabled={isSubmitting}>
                                    Agregar a la lista
                                </Button>
                                {carrito.length > 0 && (
                                    <span className="text-xs text-slate-500 font-medium">
                                        {carrito.length} tarea{carrito.length !== 1 ? 's' : ''} en lista
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── PANEL DERECHO: Carrito ── */}
                    {modoCarrito && (
                        <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                    <Icon name="list_alt" size="sm" className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-700">Lista de tareas</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    {carrito.length > 0 && (
                                        <span className="text-xs font-bold bg-marca-primario text-white px-2.5 py-1 rounded-full">
                                            {carrito.length}
                                        </span>
                                    )}
                                    {carrito.length > 0 && (
                                        <button type="button" onClick={() => setCarrito([])}
                                            className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors cursor-pointer">
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {carrito.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Icon name="inbox" size="xl" className="text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-400">Lista vacía</p>
                                        <p className="text-xs text-slate-400 mt-1 leading-snug">
                                            Llena el formulario y da clic en<br />
                                            <span className="font-bold text-slate-500">"Agregar a la lista"</span>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-0.5 custom-scrollbar">
                                    {carrito.map((item, i) => (
                                        <CarritoItem
                                            key={item._id}
                                            item={item}
                                            index={i}
                                            onRemove={handleQuitarDelCarrito}
                                            tecnicoMap={tecnicoMapCompleto}
                                            tecnicos={tecnicos}
                                            onAddTecnico={handleAgregarTecnicoItem}
                                            onRemoveTecnico={handleQuitarTecnicoItem}
                                        />
                                    ))}
                                </div>
                            )}

                            {carrito.length > 0 && (
                                <div className={cn(
                                    'flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-colors mt-auto',
                                    tecnicoCart
                                        ? 'bg-marca-primario/5 border-marca-primario/15 text-marca-primario'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                )}>
                                    <Icon name={tecnicoCart ? 'engineering' : 'person_off'} size="xs" className="shrink-0" />
                                    {tecnicoCart ? (
                                        <span>Técnico predeterminado: <strong>{tecnicoCart.nombre}</strong></span>
                                    ) : (
                                        <span className="italic">Sin técnico predeterminado</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                {modoCarrito ? (
                    <Button variant="guardar" icon="save" isLoading={isSubmitting}
                        disabled={carrito.length === 0} onClick={handleSubmit}>
                        Guardar {carrito.length > 0
                            ? `${carrito.length} tarea${carrito.length !== 1 ? 's' : ''}`
                            : 'tareas'}
                    </Button>
                ) : (
                    <Button variant="guardar" icon="save" isLoading={isSubmitting} onClick={handleSubmit}>
                        {esEdicion ? 'Guardar cambios' : 'Crear'}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};