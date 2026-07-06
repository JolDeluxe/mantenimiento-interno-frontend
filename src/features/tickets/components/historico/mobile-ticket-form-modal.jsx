import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { Label, Input, Select } from '@/components/form/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput } from '@/lib/date';
import { getMaquinaById, getMaquinas } from '@/features/maquinaria/api/maquinaria-api';
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

// ── Duration Picker (mobile — selects nativos en grid 2 cols) ─────────────
const HORAS_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DurationPicker = ({ valueMins, onChange, disabled }) => {
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
                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                    >
                        {HORAS_OPTIONS.map((h) => (
                            <option key={h} value={h}>{h} h</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>

                <div className="relative">
                    <select
                        value={minutos}
                        onChange={(e) => onChange(horas * 60 + Number(e.target.value))}
                        disabled={disabled}
                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8"
                    >
                        {MINUTOS_OPTIONS.map((m) => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
            </div>

            {totalLabel && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Icon name="timer" size="xs" />
                    {totalLabel}
                </p>
            )}
        </div>
    );
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

export const MobileTicketFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    ticketAEditar,
    currentUser,
    tecnicos = [],
    isSubmitting,
    scope = 'general',
    defaultDate,
    defaultClasificacion,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
    const [categoria, setCategoria] = useState('');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('PLANEADA');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [responsables, setResponsables] = useState([]);
    const [maquinaId, setMaquinaId] = useState('');
    const [maquinaInfo, setMaquinaInfo] = useState(null);
    const [paroProduccion, setParoProduccion] = useState(false);
    const [impactoProduccionMins, setImpactoProduccionMins] = useState(0);
    const [validatingMaquina, setValidatingMaquina] = useState(false);
    const [opcionesMaquinas, setOpcionesMaquinas] = useState([]);
    const [maquinasRaw, setMaquinasRaw] = useState([]);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);

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
            setTitulo(''); setDescripcion(''); setCategoria('');
            setMostrarDescripcion(false);
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(defaultClasificacion || (scope === 'mantenimientos' ? 'PREVENTIVO' : '')); setTipo('PLANEADA');
            setFechaVencimiento(defaultDate || ''); setTiempoEstimadoMins(0); setResponsables([]);
            setMaquinaId('');
            setMaquinaInfo(null);
            setParoProduccion(false);
            setImpactoProduccionMins(0);
        }
    }, [isOpen, esEdicion, ticketAEditar, scope, defaultDate, defaultClasificacion]);

    const puedeReportarParoProduccion = categoria === 'MAQUINARIA' && scope !== 'actividades' && Boolean(maquinaId) && clasificacion === 'CORRECTIVO';

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
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (descripcion.trim() && descripcion.trim().length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (!planta.trim()) e.planta = 'Selecciona la planta.';
        if (!area.trim()) e.area = 'El área es obligatoria.';
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

        if (esAdmin && fechaVencimiento) {
            const hoy = getMinDateHoy();
            if (fechaVencimiento < hoy) {
                const fechaOriginal = isoToDateInput(ticketAEditar?.fechaVencimiento);
                if (!esEdicion || fechaVencimiento !== fechaOriginal) {
                    e.fechaVencimiento = 'No se permiten fechas anteriores a hoy.';
                }
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

    const buildOptionLabel = (t) => {
        return t.nombre;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

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
            setBackendError(msg);
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
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="tf-titulo" error={!!fe.titulo}>Título *</Label>
                            <span className={`text-[10px] font-bold ${titulo.length >= MAX_TITULO ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                {titulo.length}/{MAX_TITULO}
                            </span>
                        </div>
                        <Input
                            id="tf-titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value.slice(0, MAX_TITULO))}
                            error={!!fe.titulo}
                            helperText={fe.titulo}
                            placeholder="Ej. Fuga de aire en compresor"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* ── FILA 1: Prioridad | Categoría | Tipo ── */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-prioridad">Prioridad *</Label>
                            <Select id="tf-prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} disabled={isSubmitting}>
                                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </Select>
                        </div>
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
                            <div className="flex flex-col gap-1.5 overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="tf-fecha" error={!!fe.fechaVencimiento}>Fecha vencimiento</Label>
                                    <div className="flex items-center gap-1.5">
                                        <button type="button" onClick={setToday} disabled={isSubmitting}
                                            className={cn("text-[10px] font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                                isHoy ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10")}>
                                            Hoy
                                        </button>
                                        <button type="button" onClick={setTomorrow} disabled={isSubmitting}
                                            className={cn("text-[10px] font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                                isManana ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10")}>
                                            Mañana
                                        </button>
                                    </div>
                                </div>
                                <Input
                                    id="tf-fecha"
                                    type="date"
                                    value={fechaVencimiento}
                                    min={hoyLocal}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setFechaVencimiento(v && v < hoyLocal ? hoyLocal : v);
                                    }}
                                    error={!!fe.fechaVencimiento}
                                    helperText={fe.fechaVencimiento}
                                    disabled={isSubmitting}
                                    style={{ minWidth: 0 }}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Tiempo estimado</Label>
                                <DurationPicker
                                    valueMins={tiempoEstimadoMins}
                                    onChange={setTiempoEstimadoMins}
                                    disabled={isSubmitting}
                                />
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
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tf-desc" error={!!fe.descripcion}>Detalles adicionales / Descripción</Label>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${descripcion.length >= MAX_DESCRIPCION ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                        {descripcion.length}/{MAX_DESCRIPCION}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDescripcion('');
                                            setMostrarDescripcion(false);
                                        }}
                                        disabled={isSubmitting}
                                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            </div>
                            <Input
                                id="tf-desc"
                                multiline
                                rows={3}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
                                error={!!fe.descripcion}
                                helperText={fe.descripcion}
                                placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                disabled={isSubmitting}
                            />
                        </div>
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
