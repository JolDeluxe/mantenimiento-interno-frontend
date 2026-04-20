// src/features/tickets/components/bandeja/bandeja-assign-modal.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Input, Select } from '@/components/form/z_index';
import { getAsignables } from '../../api/tickets-api';
import { PRIORIDADES } from '../../constants';
import { getMinDateHoy } from '@/lib/date';
import { cn } from '@/utils/cn';

const HORAS_OPTIONS = Array.from({ length: 12 }, (_, i) => i);
const MINUTOS_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DurationPicker = ({ valueMins, onChange, disabled }) => {
    const horas = Math.floor((valueMins || 0) / 60);
    const minutos = Math.round(((valueMins || 0) % 60) / 5) * 5 % 60;
    const totalLabel = valueMins > 0 ? `${valueMins} min en total` : null;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                    <select value={horas} onChange={(e) => onChange(Number(e.target.value) * 60 + minutos)} disabled={disabled}
                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8">
                        {HORAS_OPTIONS.map(h => <option key={h} value={h}>{h} h</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
                <div className="relative">
                    <select value={minutos} onChange={(e) => onChange(horas * 60 + Number(e.target.value))} disabled={disabled}
                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-marca-secundario/30 disabled:bg-slate-100 disabled:cursor-not-allowed pr-8">
                        {MINUTOS_OPTIONS.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')} min</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <Icon name="expand_more" size="sm" />
                    </div>
                </div>
            </div>
            {totalLabel && (
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Icon name="timer" size="xs" /> {totalLabel}
                </p>
            )}
        </div>
    );
};

// ─── Workload Badge ───────────────────────────────────────────────────────────
const WorkloadBadge = ({ label, count, colorClass }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        {label} <span>{count}</span>
    </span>
);

// ─── Technician row for dropdown ──────────────────────────────────────────────
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
            {/* Avatar */}
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

            {/* Info */}
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
                            Libre
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

            {/* Check */}
            <div className={cn(
                'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'
            )}>
                {isSelected && <Icon name="check" size="xs" className="text-white" />}
            </div>
        </button>
    );
};

// ─── TecnicoSelector — dropdown con workload (multi-select) ───────────────────
const TecnicoSelector = ({ tecnicos, seleccionados, onToggle, disabled, loading, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const tecnicosFiltrados = useMemo(() => {
        const q = busqueda.toLowerCase();
        return tecnicos.filter(t =>
            t.nombre.toLowerCase().includes(q) ||
            (t.cargo ?? '').toLowerCase().includes(q)
        );
    }, [tecnicos, busqueda]);

    const tecnicoMap = useMemo(() =>
        Object.fromEntries(tecnicos.map(t => [String(t.id), t])),
        [tecnicos]
    );

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

    const totalSeleccionados = seleccionados.length;

    return (
        <div className="flex flex-col gap-2" ref={containerRef}>
            {/* Trigger */}
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
                            : error
                                ? 'border-estado-rechazado bg-red-50 text-estado-rechazado hover:border-red-500 cursor-pointer'
                                : 'border-slate-300 bg-white hover:border-slate-400 cursor-pointer'
                )}
            >
                <Icon name="person_search" size="sm" className="text-slate-400 shrink-0" />
                <span className="flex-1 text-slate-500">
                    {loading ? 'Cargando personal...' : 'Buscar y seleccionar técnico(s)...'}
                </span>
                {totalSeleccionados > 0 && (
                    <span className="text-xs font-bold bg-marca-primario text-white px-2 py-0.5 rounded-full shrink-0">
                        {totalSeleccionados}
                    </span>
                )}
                <Icon
                    name="expand_more"
                    size="sm"
                    className={cn('text-slate-400 shrink-0 transition-transform', isOpen && 'rotate-180')}
                />
            </button>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
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

                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                                <Icon name="progress_activity" size="sm" className="animate-spin" />
                                <span className="text-sm">Cargando personal...</span>
                            </div>
                        ) : tecnicos.length === 0 ? (
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
                                    isSelected={seleccionados.includes(String(t.id))}
                                    onClick={() => onToggle(String(t.id))}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Chips de seleccionados */}
            {totalSeleccionados > 0 && (
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    {seleccionados.map(id => {
                        const t = tecnicoMap[id];
                        if (!t) return null;
                        const wl = t.workload;
                        const sinTareas = !wl || (wl.asignadas === 0 && wl.enProgreso === 0 && wl.enPausa === 0);
                        return (
                            <div key={id} className="flex items-center gap-2.5">
                                {t.imagen ? (
                                    <img
                                        src={t.imagen}
                                        alt={t.nombre}
                                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/img/perfil-no-foto.webp'; }}
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-marca-primario/10 flex items-center justify-center text-[11px] font-black text-marca-primario shrink-0">
                                        {t.nombre?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-bold text-slate-800 truncate block">{t.nombre}</span>
                                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                        {sinTareas ? (
                                            <span className="text-[10px] text-estado-resuelto">Libre</span>
                                        ) : (
                                            <>
                                                {wl.asignadas > 0 && <WorkloadBadge label="Asig." count={wl.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />}
                                                {wl.enProgreso > 0 && <WorkloadBadge label="Prog." count={wl.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />}
                                                {wl.enPausa > 0 && <WorkloadBadge label="Pausa" count={wl.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onToggle(id)}
                                    className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-500 text-slate-500 transition-colors"
                                >
                                    <Icon name="close" size="xs" />
                                </button>
                            </div>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => seleccionados.forEach(id => onToggle(id))}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors font-bold self-start mt-0.5"
                    >
                        Limpiar selección
                    </button>
                </div>
            )}

            {totalSeleccionados === 0 && !isOpen && (
                <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border border-dashed text-xs italic min-h-10",
                    error ? "bg-red-50 border-red-300 text-red-500" : "bg-slate-50 border-slate-300 text-slate-400"
                )}>
                    <Icon name="engineering" size="sm" />
                    Selecciona al menos un técnico para asignar
                </div>
            )}
        </div>
    );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function BandejaAssignModal({ isOpen, onClose, ticket, onConfirm, isSubmitting }) {
    const [tecnicos, setTecnicos] = useState([]);
    const [loadingTecnicos, setLoadingTecnicos] = useState(false);
    const [seleccionados, setSeleccionados] = useState([]);
    const [fechaProgramada, setFechaProgramada] = useState('');
    const [prioridad, setPrioridad] = useState('MEDIA');
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState(0);
    const [backendError, setBackendError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Carga de personal
    useEffect(() => {
        if (!isOpen) return;
        setLoadingTecnicos(true);
        getAsignables()
            .then(res => {
                const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                setTecnicos(list);
            })
            .catch(() => setTecnicos([]))
            .finally(() => setLoadingTecnicos(false));
    }, [isOpen]);

    // Reset al abrir
    useEffect(() => {
        if (!isOpen || !ticket) return;
        setSeleccionados([]);
        setFechaProgramada('');
        setPrioridad(ticket.prioridad || 'MEDIA');
        setTiempoEstimadoMins(ticket.tiempoEstimado || 0);
        setBackendError('');
        setSubmitted(false);
    }, [isOpen, ticket]);

    const handleToggle = (idStr) => {
        setSeleccionados(prev =>
            prev.includes(idStr) ? prev.filter(x => x !== idStr) : [...prev, idStr]
        );
    };

    const getErrors = () => {
        const e = {};
        if (!fechaProgramada) e.fechaProgramada = 'La fecha es obligatoria.';
        if (!prioridad) e.prioridad = 'Selecciona la prioridad.';
        if (seleccionados.length === 0) e.seleccionados = 'Debes seleccionar al menos un responsable.';
        if (!tiempoEstimadoMins || tiempoEstimadoMins <= 0) e.tiempoEstimadoMins = 'El tiempo planeado es obligatorio.';
        return e;
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        setBackendError('');
        const errors = getErrors();
        if (Object.keys(errors).length > 0) return;

        try {
            const dateISO = new Date(`${fechaProgramada}T23:59:59`).toISOString();

            await onConfirm({
                ticketId: ticket.id,
                responsables: seleccionados.map(Number),
                fechaVencimiento: dateISO,
                prioridad,
                estado: 'ASIGNADO',
                ...(tiempoEstimadoMins > 0 ? { tiempoEstimado: tiempoEstimadoMins } : {}),
            });
        } catch (err) {
            const data = err?.response?.data;
            const msg = data?.error || data?.message || 'Error al asignar el ticket.';
            setBackendError(msg);
        }
    };

    const hoyLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const dManana = new Date();
    dManana.setDate(dManana.getDate() + 1);
    const mananaLocal = new Date(dManana.getTime() - dManana.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const setToday = () => setFechaProgramada(hoyLocal);
    const setTomorrow = () => setFechaProgramada(mananaLocal);

    const isHoy = fechaProgramada === hoyLocal;
    const isManana = fechaProgramada === mananaLocal;

    const fe = submitted ? getErrors() : {};

    if (!ticket) return null;

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} className="md:max-w-2xl">
            <ModalHeader
                title="Asignar Ticket"
                onClose={() => !isSubmitting && onClose()}
            />

            <ModalBody>
                <div className="flex flex-col gap-5">

                    {/* Error de backend */}
                    {backendError && (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-rose-50 border border-rose-200 text-rose-700">
                            <Icon name="error" size="sm" /> {backendError}
                        </div>
                    )}

                    {/* Resumen del ticket */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-mono font-bold text-marca-primario block mb-1">
                                    #{ticket.id}
                                </span>
                                <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                                    {ticket.titulo}
                                </h3>
                                {(ticket.planta || ticket.area) && (
                                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                        <Icon name="factory" size="xs" className="shrink-0" />
                                        {ticket.planta || 'General'}{ticket.area ? ` — ${ticket.area}` : ''}
                                    </p>
                                )}
                            </div>
                            {ticket.creador && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Icon name="person" size="xs" className="text-slate-400" />
                                    <span className="text-xs text-slate-500">{ticket.creador.nombre}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fecha, prioridad y tiempo */}
                    <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="ba-fecha" error={!!fe.fechaProgramada}>
                                    Fecha programada *
                                </Label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={setToday}
                                        disabled={isSubmitting}
                                        className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                            isHoy ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20"
                                        )}
                                    >
                                        Hoy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={setTomorrow}
                                        disabled={isSubmitting}
                                        className={cn(
                                            "text-xs font-bold px-2 py-0.5 rounded transition-colors disabled:opacity-50 cursor-pointer",
                                            isManana ? "bg-marca-primario text-white" : "text-marca-primario bg-marca-primario/10 hover:bg-marca-primario/20"
                                        )}
                                    >
                                        Mañana
                                    </button>
                                </div>
                            </div>
                            <Input
                                id="ba-fecha"
                                type="date"
                                value={fechaProgramada}
                                min={hoyLocal}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setFechaProgramada(v && v < hoyLocal ? hoyLocal : v);
                                }}
                                error={!!fe.fechaProgramada}
                                helperText={fe.fechaProgramada}
                                disabled={isSubmitting}
                                style={{ minWidth: 0 }}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="ba-prioridad" error={!!fe.prioridad}>Prioridad *</Label>
                            <Select
                                id="ba-prioridad"
                                value={prioridad}
                                onChange={(e) => setPrioridad(e.target.value)}
                                error={!!fe.prioridad}
                                helperText={fe.prioridad}
                                disabled={isSubmitting}
                            >
                                <option value="" disabled hidden>Selecciona…</option>
                                {PRIORIDADES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label error={!!fe.tiempoEstimadoMins}>Tiempo planeado *</Label>
                            <DurationPicker
                                valueMins={tiempoEstimadoMins}
                                onChange={setTiempoEstimadoMins}
                                disabled={isSubmitting}
                            />
                            {fe.tiempoEstimadoMins && (
                                <span className="text-xs font-medium text-estado-rechazado mt-0.5">
                                    {fe.tiempoEstimadoMins}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-slate-100" />

                    {/* Selector de técnicos */}
                    <div className="flex flex-col gap-2">
                        <Label error={!!fe.seleccionados}>Personal asignado *</Label>
                        <TecnicoSelector
                            tecnicos={tecnicos}
                            seleccionados={seleccionados}
                            onToggle={handleToggle}
                            disabled={isSubmitting}
                            loading={loadingTecnicos}
                            error={!!fe.seleccionados}
                        />
                        {fe.seleccionados && (
                            <span className="text-xs font-medium text-estado-rechazado mt-0.5">{fe.seleccionados}</span>
                        )}
                    </div>

                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="engineering"
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                >
                    {seleccionados.length > 0
                        ? `Asignar a ${seleccionados.length} técnico${seleccionados.length !== 1 ? 's' : ''}`
                        : 'Confirmar'}
                </Button>
            </ModalFooter>
        </Modal>
    );
}