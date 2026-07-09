// src/features/common/forms/tareas/actividades/ActividadFormModal.jsx

import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput, localMXTimeToISO, isoToLocalMXTime, format12h } from '@/lib/date';
import { Label, Input, Select } from '@/components/form/z_index';
import { cn } from '@/utils/cn';
import {
    PLANTAS, CLASIFICACIONES_ADMIN, PRIORIDADES, TIPOS_ADMIN, ROLES_ADMIN, AREAS_POR_PLANTA, AREAS, CATEGORIAS_EQUIPO
} from '@/features/hoy/constants';
import {
    PrioridadField,
    TituloField,
    DescripcionField,
    PlantaAreaFields,
} from '@/features/common/forms/tareas/fields';
import {
    WorkloadBadge,
    TecnicoRow,
    TecnicoCartSelector,
    TecnicoDropdown,
} from '@/features/common/forms/tareas/responsables';

const MAX_TITULO = 255;
const MAX_DESCRIPCION = 500;

const HORAS_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const getSmartDefaultTimeRange = () => {
    const now = new Date();
    const hrs = now.getHours();
    const mins = now.getMinutes();

    if (hrs < 8 || hrs >= 17) {
        return { inicio: '08:00', fin: '09:00' };
    }

    let roundedMins = Math.ceil(mins / 5) * 5;
    let startHrs = hrs;
    if (roundedMins === 60) {
        roundedMins = 0;
        startHrs += 1;
    }

    if (startHrs > 16 || (startHrs === 16 && roundedMins > 30)) {
        return { inicio: '16:30', fin: '17:30' };
    }

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${pad(startHrs)}:${pad(roundedMins)}`;

    let endHrs = startHrs + 1;
    let endMins = roundedMins;
    if (endHrs > 17 || (endHrs === 17 && endMins > 30)) {
        endHrs = 17;
        endMins = 30;
    }
    const endStr = `${pad(endHrs)}:${pad(endMins)}`;

    return { inicio: startStr, fin: endStr };
};

const getDurationLabel = (inicio, fin) => {
    if (!inicio || !fin) return null;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0) {
        return `${h} h ${m > 0 ? `${m} min` : ''}`;
    }
    return `${diff} min`;
};

const deducirPlantaDeArea = (areaName, plantaActual) => {
    if (!areaName) return '';
    if (plantaActual && AREAS_POR_PLANTA[plantaActual]?.includes(areaName)) {
        return plantaActual;
    }
    for (const [plantaKey, areasList] of Object.entries(AREAS_POR_PLANTA)) {
        if (areasList.includes(areaName)) {
            return plantaKey;
        }
    }
    return '';
};

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
                            error ? "border-rose-500 focus:ring-rose-200" : "border-slate-300 focus:ring-marca-secundario/30"
                        )}
                    >
                        {HORAS_OPTIONS.map(h => <option key={h} value={h}>{h} h</option>)}
                    </select>
                    <div className={cn("pointer-events-none absolute inset-y-0 right-0 flex items-center px-2", error ? "text-rose-400" : "text-slate-400")}>
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
                            error ? "border-rose-500 focus:ring-rose-200" : "border-slate-300 focus:ring-marca-secundario/30"
                        )}
                    >
                        {MINUTOS_OPTIONS.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>)}
                    </select>
                    <div className={cn("pointer-events-none absolute inset-y-0 right-0 flex items-center px-2", error ? "text-rose-400" : "text-slate-400")}>
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
            </div>
            {totalLabel && (
                <p className={cn("text-[11px] flex items-center gap-1 transition-colors", error ? "text-rose-600 font-bold" : "text-slate-400")}>
                    <Icon name="timer" size="xs" /> {totalLabel}
                </p>
            )}
        </div>
    );
};

const TecnicoChip = ({ tecnico, onRemove }) => (
    <div className="flex items-center gap-1.5 bg-marca-primario/6 border border-marca-primario/10 rounded-full pl-2 pr-1 py-1 text-xs text-marca-primario font-bold animate-in zoom-in-95 duration-150">
        {tecnico?.imagen ? (
            <img src={tecnico.imagen} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }} />
        ) : (
            <div className="w-5 h-5 rounded-full bg-marca-primario/10 flex items-center justify-center text-[9px] font-black shrink-0">
                {tecnico?.nombre?.charAt(0).toUpperCase() ?? '?'}
            </div>
        )}
        <span className="truncate max-w-28">{tecnico?.nombre}</span>
        <button type="button" onClick={onRemove} className="w-4 h-4 rounded-full bg-marca-primario/10 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer shrink-0">
            <Icon name="close" size="xxs" />
        </button>
    </div>
);



const TecnicoAdicionalChip = ({ nombre, onRemove }) => (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {nombre}
        <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer shrink-0"
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

const CarritoItem = ({ item, index, onRemove, tecnicoMap, tecnicos, onAddTecnico, onRemoveTecnico, onCambiarTecnico }) => {
    const [expanded, setExpanded] = useState(false);
    const clasificLabel = item.clasificacion ? (CLASIFICACIONES_ADMIN.find(c => c.value === item.clasificacion)?.label || item.clasificacion) : null;
    const tipoLabel = TIPOS_ADMIN.find(t => t.value === item.tipo)?.label || item.tipo;
    const dotColor = PRIORIDAD_DOT[item.prioridad] || 'bg-slate-300';

    const tecnicosIds = item.responsables || [];
    const opcionesAdicionales = tecnicos.filter(t => !tecnicosIds.includes(String(t.id)));

    return (
        <div className={cn(
            "rounded-xl border transition-all duration-200 overflow-visible",
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
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{item.categoria}</span>
                        {clasificLabel && <span className="text-slate-300 text-[10px]">·</span>}
                        {clasificLabel && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{clasificLabel}</span>
                        )}
                        <span className="text-slate-300 text-[10px]">·</span>
                        <span className="text-[10px] text-slate-400">{item.planta}{item.area ? ` / ${item.area}` : ''}</span>
                        {tipoLabel && (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-slate-400">{tipoLabel}</span>
                            </>
                        )}
                        {item.maquinaId && (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-slate-400">M-ID: {item.maquinaId}</span>
                            </>
                        )}
                        {item.modoRangoHoras ? (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-purple-650 font-extrabold">
                                    Rango: {(() => {
                                        const startHour = item.horaInicio || (item.horaInicioProgramada ? isoToLocalMXTime(item.horaInicioProgramada) : null);
                                        const endHour = item.horaFin || (item.horaFinProgramada ? isoToLocalMXTime(item.horaFinProgramada) : null);
                                        return startHour && endHour ? `${format12h(startHour)} - ${format12h(endHour)}` : 'Rango Horario';
                                    })()}
                                </span>
                            </>
                        ) : (
                            item.tiempoEstimado > 0 && (
                                <>
                                    <span className="text-slate-300 text-[10px]">·</span>
                                    <span className="text-[10px] text-blue-650 font-extrabold">{item.tiempoEstimado} min</span>
                                </>
                            )
                        )}
                        {item.fechaVencimiento && (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-estado-asignada font-bold">{item.fechaVencimiento}</span>
                            </>
                        )}
                    </div>

                    {!expanded && tecnicosIds.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                <Icon name="engineering" size="xs" className="text-slate-400 shrink-0" />
                                <span>Técnico:</span>
                            </div>
                            <div className="relative inline-flex items-center">
                                <select
                                    value={tecnicosIds[0] || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) onCambiarTecnico(item._id, val);
                                    }}
                                    className="text-[11px] font-bold text-marca-primario bg-marca-primario/5 border border-marca-primario/15 rounded px-2 py-0.5 pr-6 focus:outline-none focus:ring-1 focus:ring-marca-secundario cursor-pointer appearance-none max-w-[150px] truncate"
                                >
                                    <option value="" disabled>Selecciona...</option>
                                    {tecnicos.map(t => (
                                        <option key={t.id} value={String(t.id)}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-1.5 flex items-center text-marca-primario/70">
                                    <Icon name="expand_more" size="xs" />
                                </div>
                            </div>
                            {tecnicosIds.length > 1 && (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                                    +{tecnicosIds.length - 1} más
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => setExpanded(!expanded)}
                        title={expanded ? 'Ocultar detalles' : 'Administrar tarea'}
                        className={cn(
                            "p-1.5 rounded-md transition-colors shrink-0",
                            expanded ? 'bg-marca-primario/10 text-marca-primario' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        )}>
                        <Icon name={expanded ? 'expand_less' : 'expand_more'} size="xs" className="shrink-0" />
                    </button>
                    <button type="button" onClick={() => onRemove(item._id)} title="Quitar tarea"
                        className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
                        <Icon name="close" size="xs" className="shrink-0" />
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

export const ActividadFormModal = ({ isOpen, onClose, ticketAEditar = null, currentUser, tecnicos = [], isSubmitting = false, onSuccess, isMobile = false, defaultModoLista = undefined, rules }) => {
    const esEdicion = !!ticketAEditar;
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);
    const isJefeOwner = currentUser?.rol === 'JEFE_MTTO';
    const isCoordinador = currentUser?.rol === 'COORDINADOR_MTTO';
    const storagePrefix = rules?.localStoragePrefix || 'hoy_actividades';
    const storageKey = (key) => `${storagePrefix}_${key}`;
    const defaultTipo = rules?.defaultTipo || 'PLANEADA';
    const allowedTipos = rules?.allowedTipos || ['PLANEADA', 'EXTRAORDINARIA'];

    const isTicket = esEdicion ? ticketAEditar?.tipo === 'TICKET' : false;
    const lockBaseFields = esEdicion && isTicket && !isJefeOwner && !isCoordinador;

    // --- BORRADORES DESDE LOCALSTORAGE (Solo en modo creación) ---
    const [carrito, setCarrito] = useState(() => {
        if (esEdicion) return [];
        try {
            const saved = localStorage.getItem(storageKey('carrito'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [modoLista, setModoLista] = useState(() => {
        if (esEdicion) return false;
        if (defaultModoLista !== undefined) return defaultModoLista;
        const saved = localStorage.getItem(storageKey('modoLista'));
        return saved !== null ? JSON.parse(saved) : true; // Actividades: ON por defecto
    });

    const [titulo, setTitulo] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('titulo')) || '';
    });

    const [descripcion, setDescripcion] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('descripcion')) || '';
    });

    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [categoria, setCategoria] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('categoria')) || '';
    });

    const [planta, setPlanta] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('planta')) || '';
    });

    const [area, setArea] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('area')) || '';
    });

    const [prioridad, setPrioridad] = useState(() => {
        if (esEdicion) return 'MEDIA';
        return localStorage.getItem(storageKey('prioridad')) || 'MEDIA';
    });
    const [tipo, setTipo] = useState(() => {
        if (esEdicion) return defaultTipo;
        return localStorage.getItem(storageKey('tipo')) || defaultTipo;
    });

    const [fechaVencimiento, setFechaVencimiento] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('fechaVencimiento')) || '';
    });

    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(() => {
        if (esEdicion) return 0;
        return Number(localStorage.getItem(storageKey('tiempoEstimado'))) || 0;
    });

    const [modoRangoHoras, setModoRangoHoras] = useState(() => {
        if (esEdicion) return false;
        return localStorage.getItem(storageKey('modoRangoHoras')) === 'true';
    });

    const [horaInicio, setHoraInicio] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('horaInicio')) || '';
    });

    const [horaFin, setHoraFin] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('horaFin')) || '';
    });

    const [responsables, setResponsables] = useState(() => {
        if (esEdicion) return [];
        try {
            const saved = localStorage.getItem(storageKey('responsables'));
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const [tecnicoCartId, setTecnicoCartId] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem(storageKey('tecnicoCartId')) || '';
    });

    const [backendError, setBackendError] = useState('');
    const [conflictError, setConflictError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        setConflictError('');
    }, [horaInicio, horaFin, fechaVencimiento, responsables]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const modoCarrito = !esEdicion && esAdmin && !isMobile && modoLista;
    const tecnicoCart = tecnicos.find(t => String(t.id) === String(tecnicoCartId));

    const areasOptions = useMemo(() => {
        const list = (planta && AREAS_POR_PLANTA[planta]) ? AREAS_POR_PLANTA[planta] : AREAS;
        return list.map(a => ({ value: a, label: a }));
    }, [planta]);

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

    // --- EFECTO PARA ESCRIBIR EL BORRADOR EN LOCALSTORAGE ---
    useEffect(() => {
        if (esEdicion) return;
        localStorage.setItem(storageKey('titulo'), titulo);
        localStorage.setItem(storageKey('descripcion'), descripcion);
        localStorage.setItem(storageKey('categoria'), categoria);
        localStorage.setItem(storageKey('planta'), planta);
        localStorage.setItem(storageKey('area'), area);
        localStorage.setItem(storageKey('prioridad'), prioridad);
        localStorage.setItem(storageKey('tipo'), tipo);
        localStorage.setItem(storageKey('fechaVencimiento'), fechaVencimiento);
        localStorage.setItem(storageKey('tiempoEstimado'), String(tiempoEstimadoMins));
        localStorage.setItem(storageKey('modoRangoHoras'), String(modoRangoHoras));
        localStorage.setItem(storageKey('horaInicio'), horaInicio);
        localStorage.setItem(storageKey('horaFin'), horaFin);
        localStorage.setItem(storageKey('tecnicoCartId'), tecnicoCartId);
        localStorage.setItem(storageKey('carrito'), JSON.stringify(carrito));
        localStorage.setItem(storageKey('modoLista'), JSON.stringify(modoLista));
        localStorage.setItem(storageKey('responsables'), JSON.stringify(responsables));
    }, [titulo, descripcion, categoria, planta, area, prioridad, tipo, fechaVencimiento, tiempoEstimadoMins, modoRangoHoras, horaInicio, horaFin, tecnicoCartId, carrito, modoLista, responsables, esEdicion, storagePrefix]);

    const clearDraft = () => {
        [
            'titulo',
            'descripcion',
            'categoria',
            'planta',
            'area',
            'prioridad',
            'tipo',
            'fechaVencimiento',
            'tiempoEstimado',
            'modoRangoHoras',
            'horaInicio',
            'horaFin',
            'tecnicoCartId',
            'carrito',
            'modoLista',
            'responsables',
        ].forEach((key) => localStorage.removeItem(storageKey(key)));
        setTitulo('');
        setDescripcion('');
        setMostrarDescripcion(false);
        setCategoria('');
        setPlanta('');
        setArea('');
        setPrioridad('MEDIA');
        setTipo(defaultTipo);
        setFechaVencimiento(hoyLocal);
        setTiempoEstimadoMins(0);
        setModoRangoHoras(false);
        setHoraInicio('');
        setHoraFin('');
        setTecnicoCartId('');
        setCarrito([]);
        setModoLista(true);
        setResponsables([]);
        setSubmitted(false);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');
        setIsDropdownOpen(false);

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setMostrarDescripcion(Boolean(ticketAEditar.descripcion && ticketAEditar.descripcion !== 'Sin descripción.'));
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setTipo(ticketAEditar.tipo ?? defaultTipo);
            setFechaVencimiento(isoToDateInput(ticketAEditar.fechaVencimiento));
            setResponsables(ticketAEditar.responsables?.map(r => String(r.id)) ?? []);



            if (ticketAEditar.horaInicioProgramada && ticketAEditar.horaFinProgramada) {
                setModoRangoHoras(true);
                setHoraInicio(isoToLocalMXTime(ticketAEditar.horaInicioProgramada));
                setHoraFin(isoToLocalMXTime(ticketAEditar.horaFinProgramada));
                setTiempoEstimadoMins(0);
            } else {
                setModoRangoHoras(false);
                setHoraInicio('');
                setHoraFin('');
                setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? ticketAEditar.tiempoEstimadoMins ?? 0);
            }
        } else {
            setMostrarDescripcion(Boolean(descripcion && descripcion.trim() !== ''));
            if (!fechaVencimiento) {
                setFechaVencimiento(hoyLocal);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, esEdicion, ticketAEditar]);

    useEffect(() => {
        if (isOpen && modoRangoHoras && !esEdicion && (!horaInicio || !horaFin)) {
            const defaults = getSmartDefaultTimeRange();
            if (!horaInicio) setHoraInicio(defaults.inicio);
            if (!horaFin) setHoraFin(defaults.fin);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modoRangoHoras, esEdicion, isOpen]);

    const handleHoraInicioChange = (val) => {
        setHoraInicio(val);
        if (val) {
            if (!horaFin || horaFin <= val) {
                const [h, m] = val.split(':').map(Number);
                let newH = h + 1;
                let newM = m;
                if (newH > 17 || (newH === 17 && newM > 30)) {
                    newH = 17;
                    newM = 30;
                }
                const pad = (n) => String(n).padStart(2, '0');
                setHoraFin(`${pad(newH)}:${pad(newM)}`);
            }
        }
    };

    const handleHoraFinChange = (val) => {
        setHoraFin(val);
        if (val) {
            if (horaInicio && val <= horaInicio) {
                const [h, m] = val.split(':').map(Number);
                let newH = h - 1;
                let newM = m;
                if (newH < 8) {
                    newH = 8;
                    newM = 0;
                }
                const pad = (n) => String(n).padStart(2, '0');
                setHoraInicio(`${pad(newH)}:${pad(newM)}`);
            }
        }
    };



    const getErrors = () => {
        const e = {};
        if (conflictError) {
            e.horaInicio = conflictError;
        }
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (descripcion.trim() && descripcion.trim().length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!prioridad) e.prioridad = 'Selecciona la prioridad.';
        if (!planta) e.planta = 'Selecciona la planta.';
        if (!area) e.area = 'Selecciona el área.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (esAdmin) {
            if (!tipo) e.tipo = 'El tipo de tarea es obligatorio.';

            if (!fechaVencimiento) {
                e.fechaVencimiento = 'La fecha de vencimiento es obligatoria.';
            } else if (fechaVencimiento < hoyLocal) {
                const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
                if (!esEdicion || fechaVencimiento !== fechaOriginal)
                    e.fechaVencimiento = 'No se permiten fechas anteriores a hoy.';
            }

            if (modoRangoHoras) {
                if (!horaInicio) {
                    e.horaInicio = 'Selecciona la hora de inicio.';
                } else if (horaInicio < '08:00' || horaInicio > '17:30') {
                    e.horaInicio = 'Debe ser entre 8:00 AM y 5:30 PM.';
                }
                if (!horaFin) {
                    e.horaFin = 'Selecciona la hora de fin.';
                } else if (horaFin < '08:00' || horaFin > '17:30') {
                    e.horaFin = 'Debe ser entre 8:00 AM y 5:30 PM.';
                }
                if (horaInicio && horaFin && horaFin <= horaInicio) {
                    e.horaFin = 'La hora de fin debe ser posterior a la de inicio.';
                }
            } else {
                if (categoria !== 'MAQUINARIA' && tiempoEstimadoMins <= 0) {
                    e.tiempoEstimado = 'El tiempo estimado es obligatorio.';
                }
            }

            if (esEdicion) {
                if (responsables.length === 0) e.responsables = 'Asigna al menos un técnico.';
            } else if (!modoCarrito) {
                if (responsables.length === 0) e.responsables = 'Asigna al menos un técnico.';
            } else {
                if (!tecnicoCartId) e.responsables = 'Debes seleccionar un técnico principal.';
            }
        }

        return e;
    };

    const handleAgregarAlCarrito = () => {
        setSubmitted(true);
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        setCarrito(prev => [...prev, {
            _id: `${Date.now()}-${Math.random()}`,
            titulo, descripcion: descripcion.trim() || 'Sin descripción.', categoria, planta, area,
            prioridad, clasificacion: null, tipo, fechaVencimiento,
            tiempoEstimado: modoRangoHoras ? 0 : tiempoEstimadoMins, esRutina: false,
            responsables: tecnicoCartId ? [tecnicoCartId] : [],
            maquinaId: null,
            modoRangoHoras,
            horaInicio: modoRangoHoras ? horaInicio : null,
            horaFin: modoRangoHoras ? horaFin : null,
            horaInicioProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio) : null,
            horaFinProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin) : null
        }]);

        setTitulo('');
        setDescripcion('');
        setTiempoEstimadoMins(0);
        setHoraInicio('');
        setHoraFin('');
        setPlanta('');
        setArea('');
        setCategoria('');
        setSubmitted(false);
        setIsDropdownOpen(false);
    };

    const handleQuitarDelCarrito = (_id) => {
        setCarrito(prev => prev.filter(item => item._id !== _id));
    };

    const handleAgregarTecnicoItem = (_id, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === _id
                ? { ...item, responsables: [...(item.responsables || []), techId] }
                : item
        ));
    };

    const handleQuitarTecnicoItem = (_id, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === _id
                ? { ...item, responsables: (item.responsables || []).filter(id => id !== techId) }
                : item
        ));
    };

    const handleCambiarTecnicoItem = (_id, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === _id
                ? { ...item, responsables: [techId, ...(item.responsables || []).filter(id => id !== techId)] }
                : item
        ));
    };

    const handleSubmit = async () => {
        setBackendError('');

        if (esEdicion) {
            setSubmitted(true);
            const errors = getErrors();
            if (Object.keys(errors).length > 0) return;

            const fd = new FormData();
            fd.append('titulo', titulo);
            fd.append('descripcion', descripcion.trim() || 'Sin descripción.');
            fd.append('clasificacion', '');
            if (categoria) fd.append('categoria', categoria);
            fd.append('planta', planta);
            fd.append('area', area);
            fd.append('prioridad', prioridad);
            fd.append('maquinaId', '');

            if (esAdmin) {
                fd.append('tipo', tipo);
                if (fechaVencimiento) fd.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));

                if (modoRangoHoras) {
                    const isoInicio = localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio);
                    const isoFin = localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin);
                    if (isoInicio) fd.append('horaInicioProgramada', isoInicio);
                    if (isoFin) fd.append('horaFinProgramada', isoFin);
                } else {
                    if (tiempoEstimadoMins > 0) fd.append('tiempoEstimado', String(tiempoEstimadoMins));
                    fd.append('horaInicioProgramada', '');
                    fd.append('horaFinProgramada', '');
                }
                responsables.forEach(id => fd.append('responsables', id));
            }

            try {
                await onSuccess(fd);
                clearDraft();
            } catch (err) {
                const data = err?.response?.data;
                let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
                if (Array.isArray(data?.errors)) msg = data.errors[0].message;
                if (msg.includes('Conflicto') || msg.includes('ya tiene programada')) {
                    setSubmitted(true);
                    setConflictError('Este técnico ya tiene una tarea programada en esa hora y fecha.');
                } else {
                    setBackendError(msg);
                }
            }
            return;
        }

        if (!modoCarrito) {
            setSubmitted(true);
            const errors = getErrors();
            if (Object.keys(errors).length > 0) return;

            const fd = new FormData();
            fd.append('titulo', titulo);
            fd.append('descripcion', descripcion.trim() || 'Sin descripción.');
            fd.append('clasificacion', '');
            if (categoria) fd.append('categoria', categoria);
            fd.append('planta', planta);
            fd.append('area', area);
            fd.append('prioridad', prioridad);
            fd.append('maquinaId', '');

            if (esAdmin) {
                fd.append('tipo', tipo);
                if (fechaVencimiento) fd.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));

                if (modoRangoHoras) {
                    const isoInicio = localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio);
                    const isoFin = localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin);
                    if (isoInicio) fd.append('horaInicioProgramada', isoInicio);
                    if (isoFin) fd.append('horaFinProgramada', isoFin);
                } else {
                    if (tiempoEstimadoMins > 0) fd.append('tiempoEstimado', String(tiempoEstimadoMins));
                }
                responsables.forEach(id => fd.append('responsables', id));
            }

            try {
                await onSuccess(fd);
                clearDraft();
            } catch (err) {
                const data = err?.response?.data;
                let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
                if (Array.isArray(data?.errors)) msg = data.errors[0].message;
                if (msg.includes('Conflicto') || msg.includes('ya tiene programada')) {
                    setSubmitted(true);
                    setConflictError('Este técnico ya tiene una tarea programada en esa hora y fecha.');
                } else {
                    setBackendError(msg);
                }
            }
            return;
        }

        // Modo Carrito (Guardar en lote)
        let finalCarrito = [...carrito];
        if (titulo.trim()) {
            setSubmitted(true);
            const errors = getErrors();
            if (Object.keys(errors).length > 0) {
                setBackendError("La tarea en el formulario tiene errores. Corrígelos o limpia los campos.");
                return;
            }

            finalCarrito.push({
                _id: `${Date.now()}-${Math.random()}`,
                titulo, descripcion: descripcion.trim() || 'Sin descripción.', categoria, planta, area,
                prioridad, clasificacion: null, tipo, fechaVencimiento,
                tiempoEstimado: modoRangoHoras ? 0 : tiempoEstimadoMins, esRutina: false,
                responsables: tecnicoCartId ? [tecnicoCartId] : [],
                maquinaId: null,
                modoRangoHoras,
                horaInicioProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio) : null,
                horaFinProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin) : null
            });
        }

        if (finalCarrito.length === 0) {
            setBackendError('Agrega al menos una tarea a la lista antes de guardar.');
            return;
        }

        try {
            const batchPayloads = finalCarrito.map(item => {
                const payload = {
                    titulo: item.titulo,
                    descripcion: item.descripcion,
                    categoria: item.categoria,
                    planta: item.planta,
                    area: item.area,
                    prioridad: item.prioridad,
                    clasificacion: null,
                    tipo: item.tipo,
                    fechaVencimiento: item.fechaVencimiento ? fechaInputToISOLocal(item.fechaVencimiento) : null,
                    responsables: item.responsables.map(Number),
                    maquinaId: null
                };
                if (item.modoRangoHoras) {
                    payload.horaInicioProgramada = item.horaInicioProgramada;
                    payload.horaFinProgramada = item.horaFinProgramada;
                } else {
                    payload.tiempoEstimado = item.tiempoEstimado;
                }
                return payload;
            });
            await onSuccess(batchPayloads);
            clearDraft();
        } catch (err) {
            const data = err?.response?.data;
            let msg = data?.error || data?.message || 'Error al procesar la solicitud.';
            if (Array.isArray(data?.errors)) msg = data.errors[0].message;
            if (msg.includes('Conflicto') || msg.includes('ya tiene programada')) {
                setSubmitted(true);
                setConflictError('Este técnico ya tiene una tarea programada en esa hora y fecha.');
            } else {
                setBackendError(msg);
            }
        }
    };

    const setToday = () => setFechaVencimiento(hoyLocal);
    const setTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        setFechaVencimiento(d.toISOString().split('T')[0]);
    };

    const isHoy = fechaVencimiento === hoyLocal;
    const isManana = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return fechaVencimiento === d.toISOString().split('T')[0];
    }, [fechaVencimiento]);

    const fe = submitted ? getErrors() : {};

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={cn("w-full", modoCarrito ? "md:max-w-5xl xl:max-w-6xl" : "md:max-w-4xl lg:max-w-5xl")}
        >
            <ModalHeader title={esEdicion ? 'Editar Actividad' : esAdmin ? 'Nueva Actividad' : 'Reportar Problema'} onClose={onClose} />

            <ModalBody>
                <div className={cn("flex gap-6", modoCarrito ? "flex-col lg:flex-row lg:items-start" : "flex-col")}>

                    {/* ── PANEL IZQUIERDO: Formulario ── */}
                    <div className={cn(
                        "flex-1 min-w-0 flex flex-col",
                        modoCarrito && "max-h-[55vh] md:max-h-[62vh] lg:max-h-[68vh]"
                    )}>
                        {backendError && (
                            <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700 shrink-0 mb-3 animate-in fade-in duration-250">
                                <div className="flex items-center gap-2">
                                    <Icon name="error" size="sm" />
                                    <span>{backendError}</span>
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "flex flex-col gap-4",
                            modoCarrito ? "flex-1 overflow-y-auto pr-3 custom-scrollbar pb-1" : ""
                        )}>

                        {/* ── OPCIONAL: SWITCH DE MODO LISTA (Crear en lote o guardar individual) ── */}
                        {esAdmin && !esEdicion && !isMobile && (
                            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-1 shrink-0 select-none">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">Crear varias tareas (Lista)</span>
                                    <span className="text-[10px] text-slate-400">Permite registrar múltiples actividades en lote</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModoLista(!modoLista)}
                                    disabled={isSubmitting || carrito.length > 0}
                                    className={cn(
                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-slate-350 transition-colors duration-200 ease-in-out focus:outline-none",
                                        modoLista ? "bg-marca-primario border-marca-primario" : "bg-slate-200"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                                            modoLista ? "translate-x-4" : "translate-x-0"
                                        )}
                                    />
                                </button>
                            </div>
                        )}



                        {/* ── TÍTULO ── */}
                        <TituloField
                            id="tf-titulo"
                            value={titulo}
                            onChange={setTitulo}
                            error={fe.titulo}
                            disabled={isSubmitting || lockBaseFields}
                            required
                            maxLength={MAX_TITULO}
                            label="Título de la actividad"
                            placeholder="Ej. Limpieza general del área, inventario de refacciones"
                        />

                        <div className={cn(
                            "grid gap-3 grid-cols-1",
                            esAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
                        )}>
                            {esAdmin && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tf-tipo" error={!!fe.tipo}>Tipo de tarea *</Label>
                                    <Select
                                        id="tf-tipo"
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        error={!!fe.tipo}
                                        helperText={fe.tipo}
                                        disabled={isSubmitting || lockBaseFields}
                                    >
                                        <option value="" disabled hidden>Selecciona…</option>
                                        {isTicket && <option value="TICKET">Ticket</option>}
                                        {TIPOS_ADMIN.filter(t => allowedTipos.includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Select>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría de la tarea *</Label>
                                <Select
                                    id="tf-cat"
                                    value={categoria}
                                    onChange={(e) => {
                                        setCategoria(e.target.value);
                                    }}
                                    error={!!fe.categoria}
                                    helperText={fe.categoria}
                                    disabled={isSubmitting || lockBaseFields}
                                >
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {CATEGORIAS_EQUIPO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Select>
                            </div>

                            <PrioridadField
                                id="tf-pri"
                                value={prioridad}
                                onChange={setPrioridad}
                                options={PRIORIDADES}
                                error={fe.prioridad}
                                disabled={isSubmitting}
                                required
                                placeholder="Selecciona…"
                            />
                        </div>



                        {/* ── FILA 2: Máquina removida para Actividades ── */}

                        {/* ── FILA 3: Planta | Área ── */}
                        <PlantaAreaFields
                            planta={planta}
                            area={area}
                            plantas={PLANTAS}
                            areasOptions={areasOptions}
                            errorPlanta={fe.planta}
                            errorArea={fe.area}
                            disabledPlanta={isSubmitting || lockBaseFields}
                            disabledArea={isSubmitting || lockBaseFields}
                            onPlantaChange={(val) => {
                                setPlanta(val);
                                const posibles = AREAS_POR_PLANTA[val] || AREAS;
                                setArea(posibles.length === 1 ? posibles[0] : '');
                            }}
                            onAreaChange={(val) => {
                                setArea(val);
                                if (val) {
                                    const plantaDeducida = deducirPlantaDeArea(val, planta);
                                    if (plantaDeducida) setPlanta(plantaDeducida);
                                }
                            }}
                            layoutClassName={isMobile
                                ? 'grid grid-cols-1 gap-3'
                                : 'grid grid-cols-1 md:grid-cols-2 gap-3'
                            }
                        />

                        {/* ── FILA 3: Fecha vencimiento | Rango de Horas ── */}
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

                                <div className="flex flex-col gap-1.5">
                                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 min-h-[24px] h-auto">
                                        <Label error={!!fe.tiempoEstimado || !!fe.horaInicio || !!fe.horaFin}>
                                            {modoRangoHoras ? 'Rango Horario *' : 'Tiempo estimado *'}
                                        </Label>

                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 select-none font-sans">
                                                <Icon name="schedule" style={{ fontSize: '8px' }} className="shrink-0" /> Rango Horario
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setModoRangoHoras(!modoRangoHoras)}
                                                disabled={isSubmitting}
                                                className={cn(
                                                    "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-slate-355 transition-colors duration-250 ease-in-out focus:outline-none focus:ring-1 focus:ring-marca-secundario/30",
                                                    modoRangoHoras ? "bg-marca-primario border-marca-primario" : "bg-slate-200"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out",
                                                        modoRangoHoras ? "translate-x-3.5" : "translate-x-0.5"
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {modoRangoHoras ? (
                                        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inicio</span>
                                                    <input
                                                        type="time"
                                                        value={horaInicio}
                                                        onChange={(e) => handleHoraInicioChange(e.target.value)}
                                                        disabled={isSubmitting}
                                                        min="08:00"
                                                        max="17:30"
                                                        step="300"
                                                        className={cn(
                                                            "w-full border rounded-sm px-3 py-[7px] text-sm bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors",
                                                            fe.horaInicio ? "border-rose-500 focus:ring-rose-200" : "border-slate-300 focus:ring-marca-secundario/30"
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fin</span>
                                                    <input
                                                        type="time"
                                                        value={horaFin}
                                                        onChange={(e) => handleHoraFinChange(e.target.value)}
                                                        disabled={isSubmitting}
                                                        min="08:00"
                                                        max="17:30"
                                                        step="300"
                                                        className={cn(
                                                            "w-full border rounded-sm px-3 py-[7px] text-sm bg-white focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors",
                                                            fe.horaFin ? "border-rose-500 focus:ring-rose-200" : "border-slate-300 focus:ring-marca-secundario/30"
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            {(() => {
                                                const label = getDurationLabel(horaInicio, horaFin);
                                                if (!label) return null;
                                                return (
                                                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-bold">
                                                        <Icon name="timer" size="xs" /> Duración: {label}
                                                    </p>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <DurationPicker valueMins={tiempoEstimadoMins} onChange={setTiempoEstimadoMins} disabled={isSubmitting} error={!!fe.tiempoEstimado} />
                                    )}

                                    {fe.tiempoEstimado && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fe.tiempoEstimado}</p>}
                                    {(fe.horaInicio || fe.horaFin) && (
                                        <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                                            {fe.horaInicio || fe.horaFin}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── ASIGNACIÓN DE TÉCNICOS (Desktop y Mobile unificado al final) ── */}
                        {esAdmin && tecnicos.length > 0 && (
                            modoCarrito ? (
                                <div className={cn(
                                    "p-3.5 rounded-xl border flex flex-col gap-3 transition-colors mb-3",
                                    fe.responsables ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon name="engineering" size="sm" className={fe.responsables ? "text-rose-500" : "text-slate-500"} />
                                            <span className={cn("text-sm font-bold", fe.responsables ? "text-rose-700" : "text-slate-700")}>
                                                Técnico principal *
                                            </span>
                                        </div>
                                    </div>

                                    <TecnicoCartSelector
                                        tecnicos={tecnicos}
                                        value={tecnicoCartId}
                                        onChange={(val) => {
                                            setTecnicoCartId(val);
                                            if (val) {
                                                setCarrito(prev => prev.map(item => {
                                                    const currentResps = item.responsables || [];
                                                    const newResps = [val, ...currentResps.filter(id => id !== val)];
                                                    return { ...item, responsables: newResps };
                                                }));
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    />
                                    {fe.responsables && <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1"><Icon name="error" size="xs" /> {fe.responsables}</p>}

                                    {tecnicoCart && (() => {
                                        const wl = tecnicoCart.workload;
                                        const sinTareas = !wl || (wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0);
                                        return (
                                            <div className={cn(
                                                'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                                                sinTareas ? 'bg-estado-resuelto/5 border-estado-resuelto/20 text-estado-resuelto' : 'bg-slate-100 border-slate-200 text-slate-600'
                                            )}>
                                                <Icon name={sinTareas ? 'check_circle' : 'assignment'} size="xs" className="shrink-0" />
                                                {sinTareas ? (
                                                    <span><strong>{tecnicoCart.nombre}</strong> no tiene tareas activas — ideal para asignar.</span>
                                                ) : (
                                                    <span><strong>{tecnicoCart.nombre}</strong> tiene {(wl.asignadas + wl.enProgreso + wl.enPausa)} tarea(s) activa(s).</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className={cn("flex flex-col gap-2 transition-[padding] duration-300 mb-3", isDropdownOpen ? "pb-[260px]" : "pb-0")}>
                                    <Label error={!!fe.responsables}>Técnicos asignados *</Label>
                                    <TecnicoDropdown
                                        opciones={opcionesDisponiblesEdit}
                                        onAdd={(idStr) => setResponsables(prev => [...prev, idStr])}
                                        disabled={isSubmitting || opcionesDisponiblesEdit.length === 0}
                                        onToggle={setIsDropdownOpen}
                                    />
                                    {fe.responsables && <p className="text-[10px] text-rose-600 font-bold mt-1">{fe.responsables}</p>}
                                    {responsables.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-12">
                                            {responsables.map(id => (
                                                <TecnicoChip key={id} tecnico={tecnicoMapEdit[id]} onRemove={() => setResponsables(prev => prev.filter(x => x !== id))} />
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

                        {/* ── DESCRIPCIÓN ── */}
                        {!mostrarDescripcion ? (
                            <div className="flex justify-start">
                                <button
                                    type="button"
                                    onClick={() => setMostrarDescripcion(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-marca-primario hover:text-marca-primario/80 transition-colors bg-marca-primario/5 hover:bg-marca-primario/10 px-3 py-1.5 rounded-lg border border-marca-primario/10 cursor-pointer text-left"
                                >
                                    <Icon name="add" size="xs" />
                                    Más detalles (Descripción)
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <DescripcionField
                                    id="tf-desc"
                                    value={descripcion}
                                    onChange={setDescripcion}
                                    onRemove={() => setMostrarDescripcion(false)}
                                    error={fe.descripcion}
                                    disabled={isSubmitting || lockBaseFields}
                                    maxLength={MAX_DESCRIPCION}
                                    rows={2}
                                    placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                />
                            </div>
                        )}
                        </div>

                        {modoCarrito && (
                            <div className="shrink-0 flex items-center justify-between pt-2 mt-0.5 border-t border-slate-100/80 bg-white">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="accion"
                                        icon="add_circle"
                                        onClick={handleAgregarAlCarrito}
                                        disabled={isSubmitting}
                                        className="!py-1 !px-2.5 !h-7.5 !text-xs"
                                    >
                                        Agregar a la lista
                                    </Button>
                                    {carrito.length > 0 && (
                                        <span className="text-[11px] text-slate-500 font-bold">
                                            {carrito.length} {carrito.length !== 1 ? 'tareas' : 'tarea'} en lista
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── PANEL DERECHO: Carrito ── */}
                    {modoCarrito && (
                        <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3 max-h-[55vh] md:max-h-[62vh] lg:max-h-[68vh]">
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
                                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-0.5 custom-scrollbar pb-1">
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
                                            onCambiarTecnico={handleCambiarTecnicoItem}
                                        />
                                    ))}
                                </div>
                            )}

                            {carrito.length > 0 && (
                                <div className={cn(
                                    'flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-colors mt-auto',
                                    tecnicoCart ? 'bg-marca-primario/5 border-marca-primario/15 text-marca-primario' : 'bg-slate-50 border-slate-200 text-slate-500'
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
                    <Button variant="guardar" icon="save" isLoading={isSubmitting} onClick={handleSubmit}>
                        Guardar { (carrito.length + (titulo.trim() ? 1 : 0)) > 0 ? `${carrito.length + (titulo.trim() ? 1 : 0)} tarea${(carrito.length + (titulo.trim() ? 1 : 0)) !== 1 ? 's' : ''}` : 'tareas' }
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
