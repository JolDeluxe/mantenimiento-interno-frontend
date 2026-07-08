// src/features/tickets/components/historico/ticket-form-modal.jsx

import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput, localMXTimeToISO, isoToLocalMXTime } from '@/lib/date';
import { validateFechaRequerida, validateFechaEdicionNoPasadaSiCambio, validateFechaInicioRecurrencia } from '@/features/common/forms/tareas/validation';
import { PrioridadField, TituloField, DescripcionField, FechaVencimientoField, DurationPicker } from '@/features/common/forms/tareas/fields';
import { WorkloadBadge, TecnicoDropdown, TecnicoCartSelector } from '@/features/common/forms/tareas/responsables';
import { Label, Input, Select } from '@/components/form/z_index';
import { cn } from '@/utils/cn';
import { getMaquinaById, getMaquinas } from '@/features/maquinaria/api/maquinaria-api';
import api from '@/lib/axios';
import {
    PLANTAS, CLASIFICACIONES_CLIENTE, CLASIFICACIONES_ADMIN,
    PRIORIDADES, TIPOS_ADMIN, ROLES_ADMIN, AREAS_POR_PLANTA, AREAS, CATEGORIAS_EQUIPO
} from '../../constants';
import { isTodayYYYYMMDD, getRecurrenceSummary } from '../../helpers/fechas';

const MAX_TITULO = 255;
const MAX_DESCRIPCION = 500;

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
    return `${m} min`;
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

const CarritoItem = ({ item, index, onRemove, tecnicoMap, tecnicos, onAddTecnico, onRemoveTecnico, onCambiarTecnico }) => {
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
                        {item.modoRangoHoras ? (
                            <>
                                <span className="text-slate-300 text-[10px]">·</span>
                                <span className="text-[10px] text-estado-asignada font-bold flex items-center gap-0.5">
                                    <Icon name="schedule" style={{ fontSize: '10px' }} />
                                    {(() => {
                                        const startHour = item.horaInicio || (item.horaInicioProgramada ? isoToLocalMXTime(item.horaInicioProgramada) : null);
                                        const endHour = item.horaFin || (item.horaFinProgramada ? isoToLocalMXTime(item.horaFinProgramada) : null);
                                        return `${startHour || ''} - ${endHour || ''}`;
                                    })()}
                                </span>
                            </>
                        ) : (
                            item.tiempoEstimado > 0 && (
                                <>
                                    <span className="text-slate-300 text-[10px]">·</span>
                                    <span className="text-[10px] text-slate-450 font-semibold">${item.tiempoEstimado} min</span>
                                </>
                            )
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

export const MantenimientosFormModal = ({
    isOpen, onClose, onSuccess,
    ticketAEditar, currentUser, tecnicos = [], isSubmitting,
    scope = 'general',
    defaultDate, defaultClasificacion,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [modoLista, setModoLista] = useState(() => {
        if (esEdicion) return false;
        const saved = localStorage.getItem('mantenimientos_modoLista');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        if (esEdicion) return;
        localStorage.setItem('mantenimientos_modoLista', JSON.stringify(modoLista));
    }, [modoLista, esEdicion]);

    const modoCarrito = !esEdicion && esAdmin && modoLista;

    const isSameDepartment = currentUser?.departamentoId === ticketAEditar?.departamentoId;
    const isJefeOwner = currentUser?.rol === 'JEFE_MTTO' && isSameDepartment;
    const isCoordinador = currentUser?.rol === 'COORDINADOR_MTTO' || currentUser?.rol === 'COORDINADOR';
    const isTicket = esEdicion ? ticketAEditar?.tipo === 'TICKET' : false;
    const lockBaseFields = esEdicion && isTicket && !isJefeOwner && !isCoordinador;

    const [carrito, setCarrito] = useState([]);
    const [tecnicoCartId, setTecnicoCartId] = useState('');

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [categoria, setCategoria] = useState(scope === 'mantenimientos' ? 'MAQUINARIA' : '');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [modoRangoHoras, setModoRangoHoras] = useState(() => {
        if (esEdicion) return false;
        return localStorage.getItem('mantenimientos_modoRangoHoras') === 'true';
    });
    const [horaInicio, setHoraInicio] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem('mantenimientos_horaInicio') || '';
    });
    const [horaFin, setHoraFin] = useState(() => {
        if (esEdicion) return '';
        return localStorage.getItem('mantenimientos_horaFin') || '';
    });

    const [responsables, setResponsables] = useState([]);

    const [maquinaId, setMaquinaId] = useState('');
    const [maquinaInfo, setMaquinaInfo] = useState(null);
    const [paroProduccion, setParoProduccion] = useState(false);
    const [impactoProduccionMins, setImpactoProduccionMins] = useState(0);
    const [validatingMaquina, setValidatingMaquina] = useState(false);
    const [opcionesMaquinas, setOpcionesMaquinas] = useState([]);
    const [maquinasRaw, setMaquinasRaw] = useState([]);

    const [backendError, setBackendError] = useState('');
    const [conflictError, setConflictError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        setConflictError('');
    }, [horaInicio, horaFin, fechaVencimiento, responsables]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Estados para Mantenimiento Recurrente
    const [esRecurrente, setEsRecurrente] = useState(false);
    const [frecuencia, setFrecuencia] = useState('MENSUAL');
    const [intervaloDias, setIntervaloDias] = useState('');

    const esRutina = ticketAEditar ? (ticketAEditar.clasificacion === 'RUTINA' || ticketAEditar.categoria === 'RUTINA') : (categoria === 'RUTINA');
    const tecnicoCart = tecnicos.find(t => String(t.id) === tecnicoCartId);

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

    // --- EFECTO PARA ESCRIBIR EL BORRADOR EN LOCALSTORAGE ---
    useEffect(() => {
        if (esEdicion) return;
        localStorage.setItem('mantenimientos_modoRangoHoras', String(modoRangoHoras));
        localStorage.setItem('mantenimientos_horaInicio', horaInicio);
        localStorage.setItem('mantenimientos_horaFin', horaFin);
    }, [modoRangoHoras, horaInicio, horaFin, esEdicion]);

    useEffect(() => {
        if (isOpen && modoRangoHoras && !esEdicion && (!horaInicio || !horaFin)) {
            const defaults = getSmartDefaultTimeRange();
            if (!horaInicio) setHoraInicio(defaults.inicio);
            if (!horaFin) setHoraFin(defaults.fin);
        }
    }, [modoRangoHoras, esEdicion, isOpen, horaInicio, horaFin]);

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

    const hoyLocal = getMinDateHoy();
    const mananaLocal = isoToDateInput(Date.now() + 86400000);
    const puedeReportarParoProduccion = categoria === 'MAQUINARIA' && scope !== 'actividades' && Boolean(maquinaId) && clasificacion === 'CORRECTIVO';

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');
        setIsDropdownOpen(false);
        setCarrito([]);

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setMostrarDescripcion(Boolean(ticketAEditar.descripcion && ticketAEditar.descripcion !== 'Sin descripción.'));
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setClasificacion(ticketAEditar.clasificacion ?? '');
            setTipo(ticketAEditar.tipo ?? 'PLANEADA');
            setFechaVencimiento(isoToDateInput(ticketAEditar.fechaVencimiento));
            setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? ticketAEditar.tiempoEstimadoMins ?? 0);
            setResponsables(ticketAEditar.responsables?.map(r => String(r.id)) ?? []);
            const targetMaquinaId = ticketAEditar.maquinaId ?? ticketAEditar.maquina?.id;
            setMaquinaId(targetMaquinaId ? String(targetMaquinaId) : '');
            setMaquinaInfo(ticketAEditar.maquina ?? null);
            setParoProduccion(Boolean(ticketAEditar.paroProduccion));
            setImpactoProduccionMins(ticketAEditar.impactoProduccion ?? 0);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria(scope === 'mantenimientos' ? 'MAQUINARIA' : '');
            setMostrarDescripcion(false);
            setPlanta(''); setArea('');
            setPrioridad('MEDIA');
            setClasificacion(defaultClasificacion || (scope === 'mantenimientos' ? 'PREVENTIVO' : ''));
            setTipo('PLANEADA');
            setFechaVencimiento((defaultDate && defaultDate >= hoyLocal) ? defaultDate : hoyLocal);
            setTiempoEstimadoMins(0); setResponsables([]);
            setTecnicoCartId('');
            setMaquinaId('');
            setMaquinaInfo(null);
            setParoProduccion(false);
            setImpactoProduccionMins(0);
            setModoRangoHoras(false);
            setHoraInicio('');
            setHoraFin('');
            
            setEsRecurrente(false);
            setFrecuencia('MENSUAL');
            setIntervaloDias('');
        }
    }, [isOpen, esEdicion, ticketAEditar, scope, defaultDate, defaultClasificacion]);

    useEffect(() => {
        if (!puedeReportarParoProduccion) {
            setParoProduccion(false);
            setImpactoProduccionMins(0);
        }
    }, [puedeReportarParoProduccion]);

    // Cargar catálogo de máquinas al abrir el modal (Thin Client: se consulta la API)
    useEffect(() => {
        if (!isOpen) return;

        const cargarCatalogoMaquinas = async () => {
            try {
                const res = await getMaquinas({ limit: 500 });
                const list = res?.data?.data || res?.data || [];
                setMaquinasRaw(list);
                const opts = list.map(m => ({
                    value: String(m.id),
                    label: `${m.codigo} - ${m.nombre}`
                }));
                setOpcionesMaquinas(opts);
            } catch (err) {
                console.error("Error al cargar máquinas en modal:", err);
            }
        };

        cargarCatalogoMaquinas();
    }, [isOpen]);

    // Efecto que observa el cambio en maquinaId y realiza validación/autocompletado (Thin Client)
    useEffect(() => {
        if (!maquinaId) {
            setMaquinaInfo(null);
            return;
        }

        const fetchMaquinaInfo = async () => {
            setValidatingMaquina(true);
            try {
                const response = await getMaquinaById(Number(maquinaId));
                if (response?.data?.status === 'success' && response?.data?.data) {
                    const maq = response.data.data;
                    setMaquinaInfo(maq);
                    setPlanta(maq.planta || '');
                    setArea(maq.area || '');
                } else if (response?.data && !response.data.status) {
                    const maq = response.data;
                    setMaquinaInfo(maq);
                    setPlanta(maq.planta || '');
                    setArea(maq.area || '');
                } else {
                    setMaquinaInfo(null);
                }
            } catch (err) {
                console.error("Error al validar máquina:", err);
                setMaquinaInfo(null);
            } finally {
                setValidatingMaquina(false);
            }
        };

        const timer = setTimeout(fetchMaquinaInfo, 400); // debounce de 400ms
        return () => clearTimeout(timer);
    }, [maquinaId]);

    const getErrors = () => {
        const e = {};
        if (conflictError) {
            e.horaInicio = conflictError;
        }

        if (esRecurrente) {
            if (!maquinaId) e.maquinaId = 'La máquina es obligatoria para mantenimiento recurrente.';
            if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
            if (!prioridad) e.prioridad = 'Selecciona la prioridad.';
            if (!planta) e.planta = 'Selecciona la planta.';
            if (!area) e.area = 'Selecciona el área.';
            if (!frecuencia) e.frecuencia = 'Selecciona la frecuencia.';
            if (frecuencia === 'PERSONALIZADA_DIAS') {
                const diasNum = parseInt(intervaloDias, 10);
                if (isNaN(diasNum) || diasNum <= 0) {
                    e.intervaloDias = 'El intervalo de días debe ser mayor que 0.';
                }
            }
            const errRecReq = validateFechaRequerida(fechaVencimiento, 'La fecha de inicio es obligatoria.');
            if (errRecReq) {
                e.fechaVencimiento = errRecReq;
            } else {
                const errRecVal = validateFechaInicioRecurrencia(fechaVencimiento, { mensaje: 'No se permiten fechas anteriores a hoy.' });
                if (errRecVal) e.fechaVencimiento = errRecVal;
            }
            if (responsables.length === 0 && !tecnicoCartId) {
                e.responsables = 'Debes asignar al menos un técnico responsable.';
            }
            return e;
        }

        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (descripcion.trim() && descripcion.trim().length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!prioridad) e.prioridad = 'Selecciona la prioridad.';
        if (!planta) e.planta = 'Selecciona la planta.';
        if (!area) e.area = 'Selecciona el área.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (maquinaId && !maquinaInfo && !validatingMaquina) {
            e.maquinaId = 'La máquina ingresada no existe.';
        }

        if (scope === 'mantenimientos') {
            if (!maquinaId) {
                e.maquinaId = 'La máquina es obligatoria para mantenimientos.';
            }
            if (!clasificacion) {
                e.clasificacion = 'La clasificación es obligatoria para mantenimientos.';
            }
        }

        if (esAdmin) {
            if (!tipo) e.tipo = 'El tipo de tarea es obligatorio.';

            // Validación: Fecha de vencimiento obligatoria
            const errReq = validateFechaRequerida(fechaVencimiento, 'La fecha de vencimiento es obligatoria.');
            if (errReq) {
                e.fechaVencimiento = errReq;
            } else {
                const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
                const errVal = validateFechaEdicionNoPasadaSiCambio(fechaVencimiento, fechaOriginal);
                if (errVal) e.fechaVencimiento = errVal;
            }

            // Validación: Rango horario o tiempo estimado
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
                // Validación: Tiempo estimado obligatorio para tickets generales, opcional en MAQUINARIA
                if (categoria !== 'MAQUINARIA' && tiempoEstimadoMins <= 0) {
                    e.tiempoEstimado = 'El tiempo estimado es obligatorio.';
                }
            }

            // Validación: Responsables obligatorios
            if (esEdicion || !modoCarrito) {
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
        setMostrarDescripcion(false);
        setPlanta(''); setArea(''); setPrioridad('');
        setClasificacion(scope === 'mantenimientos' ? 'PREVENTIVO' : ''); setTipo(''); setFechaVencimiento('');
        setTiempoEstimadoMins(0); setSubmitted(false);
        setIsDropdownOpen(false);
        setMaquinaId('');
        setMaquinaInfo(null);
        setParoProduccion(false);
        setImpactoProduccionMins(0);
        setModoRangoHoras(false);
        setHoraInicio('');
        setHoraFin('');
    };

    const handleAgregarAlCarrito = () => {
        setSubmitted(true);
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        setCarrito(prev => [...prev, {
            _id: `${Date.now()}-${Math.random()}`,
            titulo, descripcion: descripcion.trim() || 'Sin descripción.', categoria, planta, area,
            prioridad, clasificacion, tipo, fechaVencimiento,
            tiempoEstimado: modoRangoHoras ? 0 : tiempoEstimadoMins, esRutina,
            responsables: tecnicoCartId ? [tecnicoCartId] : [],
            maquinaId: maquinaId ? Number(maquinaId) : null,
            paroProduccion,
            impactoProduccion: paroProduccion && impactoProduccionMins > 0 ? impactoProduccionMins : null,
            modoRangoHoras,
            horaInicio: modoRangoHoras ? horaInicio : null,
            horaFin: modoRangoHoras ? horaFin : null,
            horaInicioProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio) : null,
            horaFinProgramada: modoRangoHoras ? localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin) : null,
        }]);
        
        // Solo reseteamos lo que cambia por tarea. El contexto (planta, área, etc) se mantiene.
        setTitulo('');
        setDescripcion('');
        setMostrarDescripcion(false);
        setTiempoEstimadoMins(0);
        setSubmitted(false);
        setIsDropdownOpen(false);
        setMaquinaId('');
        setMaquinaInfo(null);
        setParoProduccion(false);
        setImpactoProduccionMins(0);
        setModoRangoHoras(false);
        setHoraInicio('');
        setHoraFin('');
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

    const handleCambiarTecnicoItem = (itemId, techId) => {
        setCarrito(prev => prev.map(item =>
            item._id === itemId
                ? { ...item, responsables: [techId, ...(item.responsables || []).filter(id => id !== techId)] }
                : item
        ));
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
            fd.append('descripcion', descripcion.trim() || 'Sin descripción.');
            fd.append('clasificacion', clasificacion);
            if (categoria) fd.append('categoria', categoria);
            fd.append('planta', planta);
            fd.append('area', area);
            fd.append('prioridad', prioridad);
            if (maquinaId) fd.append('maquinaId', maquinaId);
            fd.append('paroProduccion', paroProduccion ? 'true' : 'false');
            if (paroProduccion && impactoProduccionMins > 0) fd.append('impactoProduccion', String(impactoProduccionMins));
            if (esAdmin) {
                fd.append('tipo', tipo);
                if (fechaVencimiento) fd.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));
                if (modoRangoHoras) {
                    const isoInicio = localMXTimeToISO(fechaVencimiento || hoyLocal, horaInicio);
                    const isoFin = localMXTimeToISO(fechaVencimiento || hoyLocal, horaFin);
                    if (isoInicio) fd.append('horaInicioProgramada', isoInicio);
                    if (isoFin) fd.append('horaFinProgramada', isoFin);
                } else {
                    if (!esRutina && tiempoEstimadoMins > 0)
                        fd.append('tiempoEstimado', String(tiempoEstimadoMins));
                }
                responsables.forEach(id => fd.append('responsables', id));
            }
            try {
                await onSuccess(fd);
                setTecnicoCartId('');
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

            if (esRecurrente) {
                try {
                    const payload = {
                        maquinaId: Number(maquinaId),
                        titulo: titulo.trim(),
                        descripcion: descripcion.trim() || 'Sin descripción.',
                        frecuencia,
                        intervaloDias: frecuencia === 'PERSONALIZADA_DIAS' ? parseInt(intervaloDias, 10) : null,
                        tecnicoResponsableId: parseInt(responsables[0] || tecnicoCartId, 10),
                        proximaFechaEjecucion: new Date(`${fechaVencimiento}T00:00:00.000Z`).toISOString(),
                        prioridad,
                        tiempoEstimado: tiempoEstimadoMins > 0 ? tiempoEstimadoMins : null,
                        categoria: categoria || 'MAQUINARIA'
                    };
                    await api.post('/api/recurrencias', payload);
                    await onSuccess(null);
                    setTecnicoCartId('');
                    onClose();
                } catch (err) {
                    const data = err?.response?.data;
                    let msg = data?.error || data?.message || 'Error al guardar el mantenimiento recurrente.';
                    setBackendError(msg);
                }
                return;
            }

            const fd = new FormData();
            fd.append('titulo', titulo);
            fd.append('descripcion', descripcion.trim() || 'Sin descripción.');
            if (categoria) fd.append('categoria', categoria);
            fd.append('planta', planta);
            fd.append('area', area);
            fd.append('prioridad', prioridad);
            fd.append('clasificacion', clasificacion);
            if (maquinaId) fd.append('maquinaId', maquinaId);
            fd.append('paroProduccion', paroProduccion ? 'true' : 'false');
            if (paroProduccion && impactoProduccionMins > 0) {
                fd.append('impactoProduccion', String(impactoProduccionMins));
            }
            
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
                setTecnicoCartId('');
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
                setBackendError("La tarea actual tiene errores. Corrígelos o limpia los campos.");
                return;
            }

            finalCarrito.push({
                _id: `${Date.now()}-${Math.random()}`,
                titulo, descripcion: descripcion.trim() || 'Sin descripción.', categoria, planta, area,
                prioridad, clasificacion, tipo, fechaVencimiento,
                tiempoEstimado: modoRangoHoras ? 0 : tiempoEstimadoMins, esRutina,
                responsables: tecnicoCartId ? [tecnicoCartId] : [],
                maquinaId: maquinaId ? Number(maquinaId) : null,
                paroProduccion,
                impactoProduccion: paroProduccion && impactoProduccionMins > 0 ? impactoProduccionMins : null,
                modoRangoHoras,
                horaInicio: modoRangoHoras ? horaInicio : null,
                horaFin: modoRangoHoras ? horaFin : null,
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
                    clasificacion: item.clasificacion,
                    categoria: item.categoria,
                    planta: item.planta,
                    area: item.area,
                    prioridad: item.prioridad,
                    maquinaId: item.maquinaId,
                    paroProduccion: item.paroProduccion,
                    impactoProduccion: item.impactoProduccion,
                    tipo: item.tipo,
                    fechaVencimiento: item.fechaVencimiento ? fechaInputToISOLocal(item.fechaVencimiento) : null,
                    responsables: item.responsables.map(Number)
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
            setTecnicoCartId('');
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
    const setTomorrow = () => setFechaVencimiento(mananaLocal);

    const isHoy = fechaVencimiento === hoyLocal;
    const isManana = fechaVencimiento === mananaLocal;

    const fe = submitted ? getErrors() : {};

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
                    <div className={cn(
                        "flex-1 min-w-0 flex flex-col",
                        modoCarrito && "max-h-[55vh] md:max-h-[62vh] lg:max-h-[68vh]"
                    )}>
                        {backendError && (
                            <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700 shrink-0 mb-3">
                                <div className="flex items-center gap-2">
                                    <Icon name="error" size="sm" />
                                    <span>{backendError}</span>
                                </div>
                                {backendError.includes("medio escribir") && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetFormFields();
                                            setBackendError('');
                                        }}
                                        className="text-xs font-bold underline hover:text-rose-900 cursor-pointer ml-auto shrink-0"
                                    >
                                        Limpiar campos
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ── SWITCH DE MODO LISTA (Crear en lote o guardar individual) ── */}
                        {esAdmin && !esEdicion && (
                            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 shrink-0 select-none">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">
                                        {scope === 'mantenimientos' ? 'Crear varios mantenimientos (Lista)' : 'Crear varias tareas (Lista)'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {scope === 'mantenimientos' ? 'Permite registrar múltiples mantenimientos en lote' : 'Permite registrar múltiples tareas en lote'}
                                    </span>
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

                        <div className={cn(
                            "flex flex-col gap-4",
                            modoCarrito ? "flex-1 overflow-y-auto pr-3 custom-scrollbar pb-3" : ""
                        )}>

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
                                        placeholder="Buscar y seleccionar técnico..."
                                        deferClearSearch
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
                        <TituloField
                            id="tf-titulo"
                            value={titulo}
                            onChange={setTitulo}
                            error={fe.titulo}
                            disabled={isSubmitting || lockBaseFields}
                            required
                            maxLength={MAX_TITULO}
                            label="Título"
                            placeholder="Ej. Fuga de aire en compresor principal"
                        />

                        {/* ── FILA 1: Clasificación | Prioridad | Categoría | Tipo ── */}
                        <div className={cn(
                            "grid gap-3 grid-cols-1",
                            ((esAdmin ? 3 : 2) + (categoria === 'MAQUINARIA' && scope !== 'actividades' ? 1 : 0) - (scope === 'mantenimientos' ? 1 : 0)) === 4
                                ? "md:grid-cols-4"
                                : ((esAdmin ? 3 : 2) + (categoria === 'MAQUINARIA' && scope !== 'actividades' ? 1 : 0) - (scope === 'mantenimientos' ? 1 : 0)) === 3
                                    ? "md:grid-cols-3"
                                    : "md:grid-cols-2"
                        )}>

                            {esAdmin && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tf-tipo" error={!!fe.tipo}>Tipo de tarea *</Label>
                                    <Select id="tf-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}
                                        error={!!fe.tipo} helperText={fe.tipo}
                                        disabled={isSubmitting || lockBaseFields}>
                                        <option value="" disabled hidden>Selecciona…</option>
                                        {isTicket && <option value="TICKET">Reporte</option>}
                                        {TIPOS_ADMIN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </Select>
                                </div>
                            )}
                            
                            {scope !== 'mantenimientos' && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría de la tarea *</Label>
                                    <Select id="tf-cat" value={categoria} onChange={(e) => {
                                        const val = e.target.value;
                                        setCategoria(val);
                                        if (val === 'RUTINA') {
                                            setClasificacion('RUTINA');
                                        } else if (val !== 'MAQUINARIA') {
                                            setClasificacion('PREVENTIVO');
                                        }

                                        // Si no es MAQUINARIA, limpiar toda la maquinaria y ubicaciones para evitar huerfanos (PWA-Proof)
                                        if (val !== 'MAQUINARIA') {
                                            setMaquinaId('');
                                            setMaquinaInfo(null);
                                            setPlanta('');
                                            setArea('');
                                        }
                                    }}
                                        error={!!fe.categoria} helperText={fe.categoria} disabled={isSubmitting || lockBaseFields}>
                                        <option value="" disabled hidden>Selecciona…</option>
                                        {CATEGORIAS_EQUIPO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </Select>
                                </div>
                            )}

                            {categoria === 'MAQUINARIA' && scope !== 'actividades' && (
                                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>{`Clasificación ${scope === 'mantenimientos' ? '*' : ''}`}</Label>
                                    <Select id="tf-clasificacion" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}
                                        error={!!fe.clasificacion} helperText={fe.clasificacion} disabled={isSubmitting}>
                                        <option value="" disabled hidden>Selecciona…</option>
                                        <option value="PREVENTIVO">Preventivo</option>
                                        <option value="CORRECTIVO">Correctivo</option>
                                    </Select>
                                </div>
                            )}

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

                        {/* ── MÁQUINA (maquinaId) con SearchableSelect condicional ── */}
                        {categoria === 'MAQUINARIA' && scope !== 'actividades' && (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="tf-maquinaId" error={!!fe.maquinaId}>{`Maquinaria Relacionada ${scope === 'mantenimientos' ? '*' : ''}`}</Label>
                                    {validatingMaquina && (
                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 animate-pulse">
                                            <Icon name="sync" size="xs" className="animate-spin" /> Validando...
                                        </span>
                                    )}
                                </div>
                                <SearchableSelect
                                    options={opcionesMaquinas}
                                    value={maquinaId}
                                    onChange={(selectedId) => {
                                        if (!selectedId) {
                                            setMaquinaId('');
                                            setMaquinaInfo(null);
                                            setPlanta('');
                                            setArea('');
                                            return;
                                        }
                                        setMaquinaId(selectedId);
                                        const maq = maquinasRaw.find(m => String(m.id) === String(selectedId));
                                        if (maq) {
                                            setMaquinaInfo(maq);
                                            setPlanta(maq.planta || '');
                                            setArea(maq.area || '');
                                        }
                                    }}
                                    placeholder="Seleccionar máquina por código o nombre..."
                                    searchPlaceholder="Buscar por MBCxxxx o nombre..."
                                    allOptionText={null}
                                    disabled={isSubmitting || lockBaseFields}
                                    icon="precision_manufacturing"
                                />
                                {fe.maquinaId && <p className="text-[10px] text-rose-600 font-bold mt-0.5">{fe.maquinaId}</p>}
                                {maquinaInfo && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-marca-primario/[0.04] border border-marca-primario/10 rounded-xl text-xs text-marca-primario font-semibold mt-1">
                                        <Icon name="info" size="xs" />
                                        <span>Máquina validada: <strong>{maquinaInfo.nombre}</strong> ({maquinaInfo.proceso})</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── INTERRUPTOR DE MANTENIMIENTO RECURRENTE ── */}
                        {!esEdicion && !modoCarrito && clasificacion === 'PREVENTIVO' && (
                            <div className="border border-slate-200/80 rounded-2xl p-4 bg-white space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                            <Icon name="event_repeat" className="text-marca-primario" size="sm" />
                                            Mantenimiento recurrente
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 mt-1 leading-normal">
                                            {esRecurrente
                                                ? "Este formulario creará una programación recurrente, no un ticket único."
                                                : maquinaId 
                                                    ? "Actívalo si este preventivo debe repetirse automáticamente."
                                                    : "Selecciona una máquina para activar recurrencia."}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!maquinaId || isSubmitting}
                                        onClick={() => setEsRecurrente(prev => !prev)}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-marca-primario focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 animate-all",
                                            esRecurrente ? "bg-marca-primario" : "bg-slate-200"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                esRecurrente ? "translate-x-5" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>

                                {esRecurrente && maquinaId && (
                                    <>
                                        <div className="text-[10px] font-bold text-marca-primario bg-marca-primario/[0.04] px-3 py-2 rounded-xl border border-marca-primario/10 flex items-center gap-1.5 mt-2 animate-in fade-in duration-200">
                                            <Icon name="info" size="xs" />
                                            <span>
                                                {isTodayYYYYMMDD(fechaVencimiento)
                                                    ? "Como la fecha inicial es hoy, el sistema también generará el primer ticket."
                                                    : "El primer ticket se generará automáticamente cuando llegue la fecha o al materializarlo manualmente."}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex flex-col gap-1.5">
                                                <Label htmlFor="rec-frecuencia" error={!!fe.frecuencia}>Frecuencia del mantenimiento *</Label>
                                                <Select
                                                    id="rec-frecuencia"
                                                    value={frecuencia}
                                                    onChange={(e) => setFrecuencia(e.target.value)}
                                                    error={!!fe.frecuencia}
                                                    helperText={fe.frecuencia}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="SEMANAL">Semanal</option>
                                                    <option value="QUINCENAL">Quincenal</option>
                                                    <option value="MENSUAL">Mensual</option>
                                                    <option value="PERSONALIZADA_DIAS">Personalizada por días</option>
                                                </Select>
                                            </div>

                                            {frecuencia === 'PERSONALIZADA_DIAS' && (
                                                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                                    <Label htmlFor="rec-intervaloDias" error={!!fe.intervaloDias}>Intervalo de días *</Label>
                                                    <Input
                                                        id="rec-intervaloDias"
                                                        type="number"
                                                        min="1"
                                                        value={intervaloDias}
                                                        onChange={(e) => setIntervaloDias(e.target.value)}
                                                        error={!!fe.intervaloDias}
                                                        helperText={fe.intervaloDias}
                                                        placeholder="Ej. 45"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mt-3 text-xs font-semibold text-slate-600 flex items-start gap-2.5 animate-in fade-in duration-200">
                                            <Icon name="info" className="text-slate-400 shrink-0 mt-0.5" size="16px" />
                                            <div className="flex-1">
                                                <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 mb-0.5">Resumen de programación</p>
                                                <span className="text-slate-700 leading-normal font-bold">
                                                    {getRecurrenceSummary({
                                                        fechaStr: fechaVencimiento,
                                                        frecuencia,
                                                        intervaloDias
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {puedeReportarParoProduccion && (
                            <div className={cn(
                                "rounded-xl border p-3.5 flex flex-col gap-3 transition-colors animate-in fade-in slide-in-from-top-1 duration-200",
                                paroProduccion ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                            )}>
                                <button
                                    type="button"
                                    onClick={() => setParoProduccion(prev => !prev)}
                                    disabled={isSubmitting}
                                    className="flex items-start gap-3 text-left disabled:opacity-60 cursor-pointer"
                                >
                                    <span className={cn(
                                        "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                        paroProduccion ? "bg-red-600 border-red-600 text-white" : "bg-white border-slate-300 text-transparent"
                                    )}>
                                        <Icon name="check" size="xs" />
                                    </span>
                                    <span className="flex flex-col gap-0.5">
                                        <span className={cn("text-sm font-black", paroProduccion ? "text-red-700" : "text-slate-700")}>
                                            La falla detuvo producción
                                        </span>
                                        <span className="text-xs text-slate-500 leading-relaxed">
                                            Al guardar, la máquina quedará como PARO PRODUCCIÓN hasta que el técnico la atienda y confirme operación.
                                        </span>
                                    </span>
                                </button>

                                {paroProduccion && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Tiempo estimado de impacto</Label>
                                            <DurationPicker
                                                valueMins={impactoProduccionMins}
                                                onChange={setImpactoProduccionMins}
                                                disabled={isSubmitting}
                                            />
                                            <p className="text-[10px] text-slate-400 font-semibold">
                                                Opcional. Sirve para reportes; no afecta el tiempo técnico.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── FILA 2: Planta | Área ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-planta" error={!!fe.planta}>Planta *</Label>
                                <Select id="tf-planta" value={planta} onChange={(e) => {
                                    const val = e.target.value;
                                    setPlanta(val);
                                    const posibles = AREAS_POR_PLANTA[val] || AREAS;
                                    setArea(posibles.length === 1 ? posibles[0] : '');
                                }} error={!!fe.planta} helperText={fe.planta} disabled={isSubmitting || lockBaseFields || !!maquinaInfo}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {PLANTAS.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-area" error={!!fe.area}>Área / Línea *</Label>
                                <Select
                                    id="tf-area"
                                    value={area || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setArea(val);
                                        if (val) {
                                            const plantaDeducida = deducirPlantaDeArea(val, planta);
                                            if (plantaDeducida) {
                                                setPlanta(plantaDeducida);
                                            }
                                        }
                                    }}
                                    error={!!fe.area}
                                    helperText={fe.area}
                                    disabled={isSubmitting || lockBaseFields || !!maquinaInfo}
                                >
                                    <option value="" disabled hidden>Selecciona área…</option>
                                    {areasOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* ── FILA 3: Fecha vencimiento | Tiempo estimado ── */}
                        {esAdmin && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FechaVencimientoField
                                    id="tf-fecha"
                                    value={fechaVencimiento}
                                    onChange={(v) => {
                                        setFechaVencimiento(v && v < hoyLocal ? hoyLocal : v);
                                    }}
                                    min={hoyLocal}
                                    label={esRecurrente ? 'Fecha de inicio del mantenimiento recurrente *' : 'Fecha de vencimiento *'}
                                    error={fe.fechaVencimiento}
                                    disabled={isSubmitting}
                                    onSetToday={setToday}
                                    onSetTomorrow={setTomorrow}
                                    isToday={isHoy}
                                    isTomorrow={isManana}
                                    description={esRecurrente ? 'Esta fecha define cuándo inicia la recurrencia. Si eliges hoy, se generará el primer mantenimiento inmediatamente. Si eliges una fecha futura, solo se guardará la programación.' : undefined}
                                />
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

                        {/* ── DESCRIPCIÓN ── */}
                        {!mostrarDescripcion ? (
                            <div className="flex justify-start">
                                <button
                                    type="button"
                                    onClick={() => setMostrarDescripcion(true)}
                                    className="flex items-center gap-1 text-xs font-bold text-marca-primario hover:text-marca-primario/80 transition-colors bg-marca-primario/5 hover:bg-marca-primario/10 px-3 py-1.5 rounded-lg border border-marca-primario/10 cursor-pointer"
                                >
                                    <Icon name="add" size="xs" />
                                    Más detalles (Descripción)
                                </button>
                            </div>
                        ) : (
                            <DescripcionField
                                id="tf-desc"
                                value={descripcion}
                                onChange={setDescripcion}
                                onRemove={() => {
                                    setDescripcion('');
                                    setMostrarDescripcion(false);
                                }}
                                error={fe.descripcion}
                                disabled={isSubmitting || lockBaseFields}
                                maxLength={MAX_DESCRIPCION}
                                label="Detalles adicionales / Descripción"
                                placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                rows={modoCarrito ? 2 : 3}
                                className="animate-in fade-in slide-in-from-top-2 duration-200"
                            />
                        )}
                        </div>

                        {modoCarrito && (
                            <div className="shrink-0 flex items-center justify-between pt-3 mt-1 border-t border-slate-100 bg-white">
                                <div className="flex items-center gap-3">
                                    <Button variant="accion" icon="add_circle" onClick={handleAgregarAlCarrito} disabled={isSubmitting}>
                                        Agregar a la lista
                                    </Button>
                                    {carrito.length > 0 && (
                                        <span className="text-xs text-slate-500 font-medium">
                                            {carrito.length} tarea{carrito.length !== 1 ? 's' : ''} en lista
                                        </span>
                                    )}
                                </div>
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
                                            onCambiarTecnico={handleCambiarTecnicoItem}
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

export { MantenimientosFormModal as TicketFormModal };
