import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { Label, Input, Select } from '@/components/form/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput } from '@/lib/date';
import {
    validateFechaEdicionNoPasadaSiCambio,
    validateFechaInicioRecurrencia,
    validateFechaRequerida,
} from '@/features/common/forms/tareas/validation';
import { PrioridadField, TituloField, DescripcionField, FechaVencimientoField, DurationPicker } from '@/features/common/forms/tareas/fields';
import { buildOptionLabel } from '@/features/common/forms/tareas/responsables';
import { getMaquinaById, getMaquinas } from '@/features/maquinaria/api/maquinaria-api';
import api from '@/lib/axios';
import {
    PLANTAS,
    CLASIFICACIONES_CLIENTE,
    CLASIFICACIONES_ADMIN,
    PRIORIDADES,
    TIPOS_ADMIN,
    ROLES_ADMIN,
    AREAS_POR_PLANTA,
    AREAS,
    CATEGORIAS_EQUIPO
} from '../../constants';
import { isTodayYYYYMMDD, getRecurrenceSummary } from '../../helpers/fechas';
import { cn } from '@/utils/cn';

const MAX_TITULO = 255;
const MAX_DESCRIPCION = 500;

const deducirPlantaDeArea = (areaName, plantaActual) => {
    if (!areaName || typeof areaName !== 'string') return '';
    const areasMap = AREAS_POR_PLANTA || {};

    if (plantaActual && Array.isArray(areasMap[plantaActual]) && areasMap[plantaActual].includes(areaName)) {
        return plantaActual;
    }
    for (const [plantaKey, areasList] of Object.entries(areasMap)) {
        if (Array.isArray(areasList) && areasList.includes(areaName)) {
            return plantaKey;
        }
    }
    return '';
};

const TecnicoChip = ({ tecnico, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 rounded-full text-xs font-bold bg-marca-primario/10 text-marca-primario border border-marca-primario/20">
        {tecnico?.imagen ? (
            <img src={tecnico.imagen} alt="" className="w-4 h-4 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }} />
        ) : (
            <div className="w-4 h-4 rounded-full bg-marca-primario/20 flex items-center justify-center text-[8px] font-black">
                {tecnico?.nombre?.charAt(0).toUpperCase() ?? '?'}
            </div>
        )}
        <span>{tecnico?.nombre ?? '…'}</span>
        <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/20 hover:bg-marca-primario/40 transition-colors cursor-pointer"
        >
            <Icon name="close" size="xs" />
        </button>
    </span>
);

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

export const MobileTicketFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    ticketAEditar,
    currentUser,
    tecnicos = [],
    isSubmitting,
    defaultDate,
    defaultClasificacion,
    scope = 'general',
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [categoria, setCategoria] = useState(scope === 'mantenimientos' ? 'MAQUINARIA' : '');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('PLANEADA');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [modoRangoHoras, setModoRangoHoras] = useState(false);
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');
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
    
    // Estados para Mantenimiento Recurrente en Móvil
    const [esRecurrente, setEsRecurrente] = useState(false);
    const [frecuencia, setFrecuencia] = useState('MENSUAL');
    const [intervaloDias, setIntervaloDias] = useState('');
    useEffect(() => {
        setConflictError('');
    }, [horaInicio, horaFin, fechaVencimiento, responsables]);

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

    const tecnicoMap = useMemo(() =>
        Object.fromEntries(tecnicos.map((t) => [String(t.id), t])),
        [tecnicos]
    );

    const opcionesDisponibles = useMemo(() =>
        tecnicos.filter((t) => !responsables.includes(String(t.id))),
        [tecnicos, responsables]
    );

    const areasOptions = useMemo(() => {
        const list = (planta && AREAS_POR_PLANTA?.[planta]) ? AREAS_POR_PLANTA[planta] : (AREAS || []);
        return Array.isArray(list) ? list.map(a => ({ value: String(a), label: String(a) })) : [];
    }, [planta]);

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

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
            setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? 0);
            setResponsables(ticketAEditar.responsables?.map((r) => String(r.id)) ?? []);
            setMaquinaId(ticketAEditar.maquinaId ? String(ticketAEditar.maquinaId) : '');
            setMaquinaInfo(ticketAEditar.maquina ?? null);
            setParoProduccion(Boolean(ticketAEditar.paroProduccion));
            setImpactoProduccionMins(ticketAEditar.impactoProduccion ?? 0);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria(scope === 'mantenimientos' ? 'MAQUINARIA' : '');
            setMostrarDescripcion(false);
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(defaultClasificacion || 'PREVENTIVO'); setTipo('PLANEADA');
            setFechaVencimiento((defaultDate && defaultDate >= hoyLocal) ? defaultDate : hoyLocal); setTiempoEstimadoMins(0); setResponsables([]);
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

    const puedeReportarParoProduccion = categoria === 'MAQUINARIA' && Boolean(maquinaId) && clasificacion === 'CORRECTIVO';

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
                console.error("Error al cargar máquinas en modal móvil:", err);
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
                console.error("Error al validar máquina en móvil:", err);
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
            if (!planta.trim()) e.planta = 'Selecciona la planta.';
            if (!area.trim()) e.area = 'El área es obligatoria.';
            if (!frecuencia) e.frecuencia = 'Selecciona la frecuencia.';
            if (frecuencia === 'PERSONALIZADA_DIAS') {
                const diasNum = parseInt(intervaloDias, 10);
                if (isNaN(diasNum) || diasNum <= 0) {
                    e.intervaloDias = 'El intervalo de días debe ser mayor que 0.';
                }
            }
            const fechaRequeridaError = validateFechaRequerida(fechaVencimiento, 'La fecha de inicio es obligatoria.');
            if (fechaRequeridaError) {
                e.fechaVencimiento = fechaRequeridaError;
            } else {
                const fechaError = validateFechaInicioRecurrencia(fechaVencimiento, {
                    mensaje: 'No se permiten fechas anteriores a hoy.',
                });
                if (fechaError) e.fechaVencimiento = fechaError;
            }
            if (responsables.length === 0) {
                e.responsables = 'Debes asignar al menos un técnico responsable.';
            }
            return e;
        }

        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (descripcion.trim() && descripcion.trim().length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (!planta.trim()) e.planta = 'Selecciona la planta.';

        if (esAdmin) {
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
        }
        if (!area.trim()) e.area = 'El área es obligatoria.';
        if (maquinaId && !maquinaInfo && !validatingMaquina) {
            e.maquinaId = 'La máquina ingresada no existe.';
        }

        if (esAdmin && fechaVencimiento) {
            const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
            const fechaError = validateFechaEdicionNoPasadaSiCambio(fechaVencimiento, fechaOriginal, {
                mensaje: 'No se permiten fechas anteriores a hoy.',
            });
            if (fechaError) {
                e.fechaVencimiento = fechaError;
            }
        }
        return e;
    };

    const handleAddTecnico = (idStr) => {
        if (!idStr || responsables.includes(idStr)) return;
        setResponsables((prev) => [...prev, idStr]);
    };

    const handleRemoveTecnico = (idStr) => {
        setResponsables((prev) => prev.filter((x) => x !== idStr));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
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
                    tecnicoResponsableId: parseInt(responsables[0], 10),
                    proximaFechaEjecucion: new Date(`${fechaVencimiento}T00:00:00.000Z`).toISOString(),
                    prioridad,
                    tiempoEstimado: tiempoEstimadoMins > 0 ? tiempoEstimadoMins : null,
                    categoria: categoria || 'MAQUINARIA'
                };
                await api.post('/api/recurrencias', payload);
                await onSuccess(null);
                onClose();
            } catch (err) {
                const data = err?.response?.data;
                let msg = data?.error || data?.message || 'Error al guardar el mantenimiento recurrente.';
                setBackendError(msg);
            }
            return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion.trim() || 'Sin descripción.');
        formData.append('clasificacion', clasificacion);
        if (categoria) formData.append('categoria', categoria);
        if (planta) formData.append('planta', planta);
        if (area) formData.append('area', area);
        formData.append('prioridad', prioridad);
        if (maquinaId) formData.append('maquinaId', maquinaId);
        formData.append('paroProduccion', paroProduccion ? 'true' : 'false');
        if (paroProduccion && impactoProduccionMins > 0) {
            formData.append('impactoProduccion', String(impactoProduccionMins));
        }

        if (esAdmin) {
            formData.append('tipo', tipo);
            if (fechaVencimiento) formData.append('fechaVencimiento', fechaInputToISOLocal(fechaVencimiento));
            if (tiempoEstimadoMins > 0) formData.append('tiempoEstimado', String(tiempoEstimadoMins));
            responsables.forEach((id) => formData.append('responsables', id));
        }

        try {
            await onSuccess(formData);
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

    const fe = submitted ? getErrors() : {};
    const hoyLocal = getMinDateHoy();
    const mananaLocal = isoToDateInput(Date.now() + 86400000);
    const setToday = () => setFechaVencimiento(hoyLocal);
    const setTomorrow = () => setFechaVencimiento(mananaLocal);
    const isHoy = fechaVencimiento === hoyLocal;
    const isManana = fechaVencimiento === mananaLocal;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full h-full m-0 rounded-none sm:rounded-xl sm:h-auto">
            <ModalHeader
                title={esEdicion ? 'Editar tarea' : esAdmin ? 'Nueva tarea' : 'Reportar problema'}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-6 pb-4 overflow-x-hidden">

                    {backendError && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                            <Icon name="error" size="sm" /> {backendError}
                        </div>
                    )}

                    {/* ── TÍTULO ── */}
                    <TituloField
                        id="tf-titulo"
                        value={titulo}
                        onChange={setTitulo}
                        error={fe.titulo}
                        disabled={isSubmitting}
                        required
                        maxLength={MAX_TITULO}
                        label="Título"
                        placeholder="Ej. Fuga de aire en compresor"
                    />

                    {/* ── FILA 1: Prioridad | Categoría | Tipo ── */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <PrioridadField
                            id="tf-prioridad"
                            value={prioridad}
                            onChange={setPrioridad}
                            options={PRIORIDADES}
                            disabled={isSubmitting}
                            required
                        />
                        {scope !== 'mantenimientos' && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría del equipo *</Label>
                                <Select id="tf-cat" value={categoria} onChange={(e) => {
                                    const val = e.target.value;
                                    setCategoria(val);
                                    if (val === 'RUTINA') {
                                        setClasificacion('RUTINA');
                                    } else if (val !== 'MAQUINARIA') {
                                        setClasificacion('PREVENTIVO');
                                    }
                                    if (val !== 'MAQUINARIA') {
                                        setMaquinaId('');
                                        setMaquinaInfo(null);
                                        setPlanta('');
                                        setArea('');
                                    }
                                }}
                                    error={!!fe.categoria} helperText={fe.categoria} disabled={isSubmitting}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    {CATEGORIAS_EQUIPO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </Select>
                            </div>
                        )}
                        {categoria === 'MAQUINARIA' && (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="tf-maquinaId" error={!!fe.maquinaId}>Maquinaria Relacionada</Label>
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
                                    disabled={isSubmitting}
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
                        {categoria === 'MAQUINARIA' && (
                            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>Clasificación *</Label>
                                <Select id="tf-clasificacion" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}
                                    error={!!fe.clasificacion} helperText={fe.clasificacion} disabled={isSubmitting}>
                                    <option value="" disabled hidden>Selecciona…</option>
                                    <option value="PREVENTIVO">Preventivo</option>
                                    <option value="CORRECTIVO">Correctivo</option>
                                </Select>
                            </div>
                        )}

                        {/* ── INTERRUPTOR DE MANTENIMIENTO RECURRENTE (MÓVIL) ── */}
                        {!esEdicion && clasificacion === 'PREVENTIVO' && (
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
                                "sm:col-span-2 rounded-xl border p-3.5 flex flex-col gap-3 transition-colors animate-in fade-in slide-in-from-top-1 duration-200",
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
                                            La máquina quedará como PARO PRODUCCIÓN hasta que mantenimiento confirme operación.
                                        </span>
                                    </span>
                                </button>

                                {paroProduccion && (
                                    <div className="pl-8 flex flex-col gap-1.5">
                                        <Label>Tiempo estimado de impacto</Label>
                                        <DurationPicker
                                            valueMins={impactoProduccionMins}
                                            onChange={setImpactoProduccionMins}
                                            disabled={isSubmitting}
                                            hoursCount={24}
                                            selectBaseClassName="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                                            selectNormalClassName=""
                                            iconBaseClassName="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
                                            iconNormalClassName=""
                                            totalLabelBaseClassName="text-[11px] text-slate-400 flex items-center gap-1"
                                            totalLabelNormalClassName=""
                                        />
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                            Opcional. Sirve para reportes; no afecta el tiempo técnico.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {esAdmin && (
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tipo">Tipo de tarea *</Label>
                                <Select id="tf-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={isSubmitting || esEdicion}>
                                    {TIPOS_ADMIN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* ── FILA 2: Planta | Área ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-planta" error={!!fe.planta}>Planta *</Label>
                            <Select id="tf-planta" value={planta} onChange={(e) => { 
                                const val = e.target.value;
                                setPlanta(val); 
                                const posibles = (AREAS_POR_PLANTA && AREAS_POR_PLANTA[val]) || AREAS || [];
                                setArea(Array.isArray(posibles) && posibles.length === 1 ? posibles[0] : '');
                            }} error={!!fe.planta} helperText={fe.planta} disabled={isSubmitting || !!maquinaInfo}>
                                <option value="" disabled hidden>Selecciona…</option>
                                {PLANTAS.map((p) => <option key={p} value={p}>{p}</option>)}
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
                                disabled={isSubmitting || !!maquinaInfo}
                            >
                                <option value="" disabled hidden>Selecciona área…</option>
                                {areasOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* ── FILA 3: Fecha | Tiempo Estimado (Solo Admin) ── */}
                    {esAdmin && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FechaVencimientoField
                                id="tf-fecha"
                                value={fechaVencimiento}
                                onChange={(v) => {
                                    setFechaVencimiento(v && v < hoyLocal ? hoyLocal : v);
                                }}
                                min={hoyLocal}
                                label={esRecurrente ? 'Fecha de inicio del mantenimiento recurrente' : 'Fecha de vencimiento'}
                                error={fe.fechaVencimiento}
                                disabled={isSubmitting}
                                onSetToday={setToday}
                                onSetTomorrow={setTomorrow}
                                isToday={isHoy}
                                isTomorrow={isManana}
                                description={esRecurrente ? 'Esta fecha define cuándo inicia la recurrencia. Si eliges hoy, se generará el primer mantenimiento inmediatamente. Si eliges una fecha futura, solo se guardará la programación.' : undefined}
                                quickButtonBaseClassName="text-[10px] font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                                quickButtonInactiveClassName="text-marca-primario bg-marca-primario/10"
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
                                    <DurationPicker
                                        valueMins={tiempoEstimadoMins}
                                        onChange={setTiempoEstimadoMins}
                                        disabled={isSubmitting}
                                        hoursCount={24}
                                        selectBaseClassName="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                                        selectNormalClassName=""
                                        iconBaseClassName="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
                                        iconNormalClassName=""
                                        totalLabelBaseClassName="text-[11px] text-slate-400 flex items-center gap-1"
                                        totalLabelNormalClassName=""
                                    />
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

                    {/* ── ASIGNACIÓN DE TÉCNICOS (Admin) ── */}
                    {esAdmin && tecnicos.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="tf-tecnicos-add">Técnicos asignados (opcional)</Label>

                            <Select
                                id="tf-tecnicos-add"
                                value=""
                                onChange={(e) => handleAddTecnico(e.target.value)}
                                disabled={isSubmitting || opcionesDisponibles.length === 0}
                            >
                                <option value="" disabled hidden>
                                    {opcionesDisponibles.length === 0 ? 'Todos asignados' : 'Seleccionar técnico…'}
                                </option>
                                {opcionesDisponibles.map((t) => (
                                    <option key={t.id} value={String(t.id)}>
                                        {buildOptionLabel(t)}
                                    </option>
                                ))}
                            </Select>

                            {responsables.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 min-h-12">
                                    {responsables.map((id) => (
                                        <TecnicoChip
                                            key={id}
                                            tecnico={tecnicoMap[id]}
                                            onRemove={() => handleRemoveTecnico(id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-xs italic min-h-12">
                                    <Icon name="engineering" size="sm" />
                                    Sin técnicos asignados (la tarea quedará PENDIENTE)
                                </div>
                            )}
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
                            disabled={isSubmitting}
                            maxLength={MAX_DESCRIPCION}
                            label="Detalles adicionales / Descripción"
                            placeholder="Describe el problema o tarea con el mayor detalle posible…"
                            rows={3}
                            className="animate-in fade-in slide-in-from-top-2 duration-200"
                        />
                    )}

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="guardar" icon="save" isLoading={isSubmitting} onClick={handleSubmit}>
                    {esEdicion ? 'Guardar cambios' : 'Crear'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export { MobileTicketFormModal as MobileMantenimientosFormModal };
