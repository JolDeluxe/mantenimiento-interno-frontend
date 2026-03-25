// src/features/tickets/components/historico/ticket-form-modal.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, SearchableSelect } from '@/components/ui/z_index';
import { getMinDateHoy, fechaInputToISOLocal } from '@/lib/date';
import { Label, Input, Select } from '@/components/form/z_index';
import { cn } from '@/utils/cn';

const PLANTAS = ['KAPPA', 'OMEGA', 'SIGMA', 'LAMBDA', 'ADMINISTRATIVOS', 'GENERAL'];

const CLASIFICACIONES_CLIENTE = [
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
];

const CLASIFICACIONES_ADMIN = [
    { value: 'PREVENTIVO', label: 'Preventivo' },
    { value: 'CORRECTIVO', label: 'Correctivo' },
    { value: 'INSPECCION', label: 'Inspección' },
    { value: 'MEJORA', label: 'Mejora' },
    { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
    { value: 'RUTINA', label: 'Rutina' },
];

const PRIORIDADES = [
    { value: 'BAJA', label: 'Baja' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'CRITICA', label: 'Crítica' },
];

const TIPOS_ADMIN = [
    { value: 'PLANEADA', label: 'Planeada' },
    { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

const ROLES_ADMIN = new Set(['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO']);

const MAX_TITULO = 80;
const MAX_DESCRIPCION = 500;


const WorkloadBadge = ({ label, count, colorClass }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        {label} <span>{count}</span>
    </span>
);

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
        <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center w-4 h-4 rounded-full bg-marca-primario/20 hover:bg-marca-primario/40 transition-colors cursor-pointer shrink-0"
        >
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
                setIsOpen(false);
                onToggle?.(false);
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
            <div
                onClick={toggle}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors",
                    disabled
                        ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white border-slate-300 hover:border-marca-primario text-slate-700 cursor-pointer"
                )}
            >
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
                        opciones.map((opt) => {
                            const t = opt.tecnico;
                            const workload = t.workload || { asignadas: 0, enProgreso: 0, enPausa: 0 };
                            const sinTareas = workload.asignadas === 0 && workload.enProgreso === 0 && workload.enPausa === 0;

                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onAdd(opt.value);
                                        setIsOpen(false);
                                        onToggle?.(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-100 last:border-0"
                                >
                                    {/* Avatar */}
                                    {t.imagen ? (
                                        <img
                                            src={t.imagen}
                                            alt={t.nombre}
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-marca-primario/10 flex items-center justify-center text-xs font-bold text-marca-primario shrink-0">
                                            {t.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-slate-800 truncate">{t.nombre}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {t.cargo && (
                                                <span className="text-[10px] text-slate-400 truncate">{t.cargo}</span>
                                            )}
                                            {sinTareas ? (
                                                <span className="text-[10px] text-estado-resuelto italic">Sin tareas</span>
                                            ) : (
                                                <>
                                                    {workload.asignadas > 0 && <WorkloadBadge label="Asig." count={workload.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />}
                                                    {workload.enProgreso > 0 && <WorkloadBadge label="Prog." count={workload.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />}
                                                    {workload.enPausa > 0 && <WorkloadBadge label="Pausa" count={workload.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />}
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

export const TicketFormModal = ({
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
    const [tiempoEstimado, setTiempoEstimado] = useState('');
    const [responsables, setResponsables] = useState([]);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const opcionesTecnicos = useMemo(() =>
        tecnicos.map((t) => ({
            value: String(t.id),
            tecnico: t
        })),
        [tecnicos]
    );

    const tecnicoMap = useMemo(() =>
        Object.fromEntries(tecnicos.map((t) => [String(t.id), t])),
        [tecnicos]
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

            const fv = ticketAEditar.fechaVencimiento ? ticketAEditar.fechaVencimiento.split('T')[0] : '';
            setFechaVencimiento(fv);

            setTiempoEstimado(ticketAEditar.tiempoEstimado ? String(ticketAEditar.tiempoEstimado) : '');
            setResponsables(ticketAEditar.responsables?.map((r) => String(r.id)) ?? []);
        } else {
            setTitulo(''); setDescripcion(''); setCategoria('');
            setPlanta(''); setArea(''); setPrioridad('MEDIA');
            setClasificacion(''); setTipo('PLANEADA');
            setFechaVencimiento(''); setTiempoEstimado(''); setResponsables([]);
        }
    }, [isOpen, esEdicion, ticketAEditar]);

    const getErrors = () => {
        const e = {};
        if (!titulo.trim() || titulo.length < 3) e.titulo = 'Mínimo 3 caracteres.';
        if (!descripcion.trim() || descripcion.length < 3) e.descripcion = 'Mínimo 3 caracteres.';
        if (!clasificacion) e.clasificacion = 'Selecciona la clasificación.';
        if (!esAdmin) {
            if (!categoria.trim()) e.categoria = 'La categoría es obligatoria.';
            if (!planta.trim()) e.planta = 'Selecciona la planta.';
            if (!area.trim()) e.area = 'El área es obligatoria.';
        }

        // LÓGICA STRICTA DE FECHAS: Bloqueo explícito al submit manual
        if (esAdmin && fechaVencimiento) {
            const hoy = getMinDateHoy();
            if (fechaVencimiento < hoy) {
                const fechaOriginal = ticketAEditar?.fechaVencimiento ? ticketAEditar.fechaVencimiento.split('T')[0] : '';
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

    const opcionesDisponibles = useMemo(() =>
        opcionesTecnicos.filter((opt) => !responsables.includes(opt.value)),
        [opcionesTecnicos, responsables]
    );

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
            if (tiempoEstimado) formData.append('tiempoEstimado', tiempoEstimado);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full md:max-w-4xl lg:max-w-5xl">
            <ModalHeader
                title={esEdicion ? 'Editar tarea' : esAdmin ? 'Nueva tarea' : 'Nueva tarea'}
                onClose={onClose}
            />
            <ModalBody>
                <div className="flex flex-col gap-6">

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
                            placeholder="Ej. Fuga de aire en compresor principal"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* ── CLASIFICACIÓN / PRIORIDAD / PLANTA / ÁREA ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-clasificacion" error={!!fe.clasificacion}>Clasificación *</Label>
                            <Select
                                id="tf-clasificacion"
                                value={clasificacion}
                                onChange={(e) => setClasificacion(e.target.value)}
                                error={!!fe.clasificacion}
                                helperText={fe.clasificacion}
                                disabled={isSubmitting}
                            >
                                <option value="" disabled hidden>Selecciona…</option>
                                {clasificacionesOpts.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-prioridad">Prioridad</Label>
                            <Select
                                id="tf-prioridad"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {PRIORIDADES.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-planta" error={!!fe.planta}>Planta {!esAdmin && '*'}</Label>
                            <Select
                                id="tf-planta"
                                value={planta}
                                onChange={(e) => setPlanta(e.target.value)}
                                error={!!fe.planta}
                                helperText={fe.planta}
                                disabled={isSubmitting}
                            >
                                <option value="" disabled hidden>Selecciona…</option>
                                {PLANTAS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-area" error={!!fe.area}>Área / Línea {!esAdmin && '*'}</Label>
                            <Input
                                id="tf-area"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                error={!!fe.area}
                                helperText={fe.area}
                                placeholder="Ej. Pespunte, Láser, Almacén…"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* ── CATEGORÍA (solo clientes) ── */}
                    {!esAdmin && (
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tf-categoria" error={!!fe.categoria}>Categoría del equipo *</Label>
                            <Input
                                id="tf-categoria"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                error={!!fe.categoria}
                                helperText={fe.categoria}
                                placeholder="Ej. Eléctrico, Mecánico, Infraestructura…"
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    {/* ── CAMPOS ADMINISTRATIVOS ── */}
                    {esAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tipo">Tipo de tarea</Label>
                                <Select
                                    id="tf-tipo"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    disabled={isSubmitting || esEdicion}
                                >
                                    {TIPOS_ADMIN.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5 overflow-hidden">
                                <Label htmlFor="tf-fecha" error={!!fe.fechaVencimiento}>Fecha de vencimiento</Label>
                                <Input
                                    id="tf-fecha"
                                    type="date"
                                    value={fechaVencimiento}
                                    min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const nuevaFecha = e.target.value;
                                        // Calculamos hoy exactamente con la misma regla de tu min para evitar desfases
                                        const hoyLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

                                        // Escudo anti-Safari: Si logra escribir/seleccionar un día viejo, lo forzamos a hoy
                                        if (nuevaFecha && nuevaFecha < hoyLocal) {
                                            setFechaVencimiento(hoyLocal);
                                        } else {
                                            setFechaVencimiento(nuevaFecha);
                                        }
                                    }}
                                    error={!!fe.fechaVencimiento}
                                    helperText={fe.fechaVencimiento}
                                    disabled={isSubmitting}
                                    style={{ minWidth: 0 }}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="tf-tiempo">Tiempo estimado (min)</Label>
                                <Input
                                    id="tf-tiempo"
                                    type="number"
                                    min="1"
                                    value={tiempoEstimado}
                                    onChange={(e) => setTiempoEstimado(e.target.value)}
                                    placeholder="Ej. 60"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── ASIGNACIÓN DE TÉCNICOS (admin) + DESCRIPCIÓN ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Control de Técnicos con Expansión Dinámica */}
                        {esAdmin && tecnicos.length > 0 && (
                            <div className={cn(
                                "flex flex-col gap-2 transition-[padding] duration-300 ease-in-out",
                                isDropdownOpen ? "pb-[260px]" : "pb-0"
                            )}>
                                <Label>Técnicos asignados (opcional)</Label>

                                <TecnicoDropdown
                                    opciones={opcionesDisponibles}
                                    onAdd={handleAddTecnico}
                                    disabled={isSubmitting || opcionesDisponibles.length === 0}
                                    onToggle={setIsDropdownOpen}
                                />

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

                        <div className={cn('flex flex-col gap-1.5', (!esAdmin || tecnicos.length === 0) && 'lg:col-span-2')}>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tf-desc" error={!!fe.descripcion}>Descripción *</Label>
                                <span className={`text-[10px] font-bold ${descripcion.length >= MAX_DESCRIPCION ? 'text-estado-rechazado' : 'text-slate-400'}`}>
                                    {descripcion.length}/{MAX_DESCRIPCION}
                                </span>
                            </div>
                            <Input
                                id="tf-desc"
                                multiline
                                rows={esAdmin && tecnicos.length > 0 ? 5 : 4}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value.slice(0, MAX_DESCRIPCION))}
                                error={!!fe.descripcion}
                                helperText={fe.descripcion}
                                placeholder="Describe el problema o tarea con el mayor detalle posible…"
                                disabled={isSubmitting}
                            />
                        </div>
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