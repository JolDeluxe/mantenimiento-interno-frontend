// src/features/tickets/components/historico/mobile-ticket-form-modal.jsx
import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input, Select } from '@/components/form/z_index';
import { getMinDateHoy, fechaInputToISOLocal, isoToDateInput } from '@/lib/date';
import {
    PLANTAS,
    CLASIFICACIONES_CLIENTE,
    CLASIFICACIONES_ADMIN,
    PRIORIDADES,
    TIPOS_ADMIN,
    ROLES_ADMIN,
    AREAS_POR_PLANTA,
    AREAS
} from '../../constants';
import { cn } from '@/utils/cn';

const MAX_TITULO = 80;
const MAX_DESCRIPCION = 500;

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
                {/* Horas */}
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

                {/* Minutos */}
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

// ── Chip de técnico seleccionado ──────────────────────────────────────────
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

// ── Modal principal ───────────────────────────────────────────────────────
export const MobileTicketFormModal = ({
    isOpen,
    onClose,
    onSuccess,
    ticketAEditar,
    currentUser,
    tecnicos = [],
    isSubmitting,
}) => {
    const esEdicion = Boolean(ticketAEditar);
    const esAdmin = ROLES_ADMIN.has(currentUser?.rol);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('');
    const [planta, setPlanta] = useState('');
    const [area, setArea] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [clasificacion, setClasificacion] = useState('');
    const [tipo, setTipo] = useState('PLANEADA');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [responsables, setResponsables] = useState([]);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const tecnicoMap = useMemo(() =>
        Object.fromEntries(tecnicos.map((t) => [String(t.id), t])),
        [tecnicos]
    );

    // Opciones para el <select> nativo — excluye ya seleccionados
    const opcionesDisponibles = useMemo(() =>
        tecnicos.filter((t) => !responsables.includes(String(t.id))),
        [tecnicos, responsables]
    );

    useEffect(() => {
        if (!isOpen) return;
        setSubmitted(false);
        setBackendError('');

        if (esEdicion) {
            setTitulo(ticketAEditar.titulo ?? '');
            setDescripcion(ticketAEditar.descripcion ?? '');
            setCategoria(ticketAEditar.categoria ?? '');
            setPlanta(ticketAEditar.planta ?? '');
            setArea(ticketAEditar.area ?? '');
            setPrioridad(ticketAEditar.prioridad ?? 'MEDIA');
            setClasificacion(ticketAEditar.clasificacion ?? '');
            setTipo(ticketAEditar.tipo ?? 'PLANEADA');
            // Corrección: usar isoToDateInput para evitar crash en Safari/iOS con split('T')[0]
            setFechaVencimiento(isoToDateInput(ticketAEditar.fechaVencimiento));
            setTiempoEstimadoMins(ticketAEditar.tiempoEstimado ?? 0);
            setResponsables(ticketAEditar.responsables?.map((r) => String(r.id)) ?? []);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria('');
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(''); setTipo('PLANEADA');
            setFechaVencimiento(''); setTiempoEstimadoMins(0); setResponsables([]);
        }
    }, [isOpen, esEdicion, ticketAEditar]);

    const getErrors = () => {
        const e = {};
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (!descripcion.trim() || descripcion.length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!clasificacion) e.clasificacion = 'Selecciona la clasificación.';
        if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
        if (!planta.trim()) e.planta = 'Selecciona la planta.';
        if (!area.trim()) e.area = 'El área es obligatoria.';

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

    // Genera label enriquecido para el option nativo
    const buildOptionLabel = (t) => {
        const { workload } = t;
        const sinTareas = !workload ||
            (workload.asignadas === 0 && workload.enProgreso === 0 && workload.enPausa === 0);

        if (sinTareas) return `${t.nombre}${t.cargo ? ` — ${t.cargo}` : ''} · Sin tareas`;

        const parts = [];
        if (workload.asignadas > 0) parts.push(`Asig. ${workload.asignadas}`);
        if (workload.enProgreso > 0) parts.push(`Prog. ${workload.enProgreso}`);
        if (workload.enPausa > 0) parts.push(`Pausa ${workload.enPausa}`);

        return `${t.nombre}${t.cargo ? ` — ${t.cargo}` : ''} · ${parts.join('  ')}`;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('clasificacion', clasificacion);
        if (categoria) formData.append('categoria', categoria);
        if (planta) formData.append('planta', planta);
        if (area) formData.append('area', area);
        formData.append('prioridad', prioridad);

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
    const clasificacionesOpts = esAdmin ? CLASIFICACIONES_ADMIN : CLASIFICACIONES_CLIENTE;
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

                    {/* ── FILA 1: Clasificación | Prioridad | Categoría | Tipo ── */}
                    <div className={cn("grid gap-4", esAdmin ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>Clasificación *</Label>
                            <Select id="tf-clasificacion" value={clasificacion} onChange={(e) => setClasificacion(e.target.value)} error={!!fe.clasificacion} helperText={fe.clasificacion} disabled={isSubmitting}>
                                <option value="" disabled hidden>Selecciona…</option>
                                {clasificacionesOpts.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-prioridad">Prioridad *</Label>
                            <Select id="tf-prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)} disabled={isSubmitting}>
                                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-cat" error={!!fe.categoria}>Categoría del equipo *</Label>
                            <Select id="tf-cat" value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                error={!!fe.categoria} helperText={fe.categoria} disabled={isSubmitting}>
                                <option value="" disabled hidden>Selecciona…</option>
                                <option value="MAQUINARIA">Maquinaria</option>
                                <option value="INFRAESTRUCTURA">Infraestructura</option>
                                <option value="MOBILIARIO">Mobiliario</option>
                                <option value="SISTEMAS">Sistemas / IT</option>
                                <option value="VEHICULOS">Vehículos</option>
                                <option value="GENERAL">General / Otro</option>
                            </Select>
                        </div>
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
                            <Select id="tf-planta" value={planta} onChange={(e) => { setPlanta(e.target.value); setArea(''); }} error={!!fe.planta} helperText={fe.planta} disabled={isSubmitting}>
                                <option value="" disabled hidden>Selecciona…</option>
                                {PLANTAS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-area" error={!!fe.area}>Área / Línea *</Label>
                            <Select id="tf-area" value={area} onChange={(e) => setArea(e.target.value)} error={!!fe.area} helperText={fe.area} disabled={isSubmitting}>
                                <option value="" disabled hidden>Selecciona…</option>
                                {(planta && AREAS_POR_PLANTA[planta] ? AREAS_POR_PLANTA[planta] : AREAS).map((a) => (
                                    <option key={a} value={a}>{a}</option>
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
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="tf-desc" error={!!fe.descripcion}>Descripción *</Label>
                            <span className={`text-[10px] font-bold ${descripcion.length >= MAX_DESCRIPCION ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                {descripcion.length}/{MAX_DESCRIPCION}
                            </span>
                        </div>
                        <Input
                            id="tf-desc"
                            multiline
                            rows={4}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
                            error={!!fe.descripcion}
                            helperText={fe.descripcion}
                            placeholder="Describe el problema o tarea con el mayor detalle posible…"
                            disabled={isSubmitting}
                        />
                    </div>

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