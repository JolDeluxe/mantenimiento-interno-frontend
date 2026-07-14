// src/features/common/components/ticket-assign-modal.jsx
import { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { formatFechaRelativa, formatDurationToDaysHours, getMinDateHoy, isoToDateInput, isoToLocalMXTime, localMXTimeToISO } from '@/lib/date';

const ROL_LABEL = {
    TECNICO: 'Técnico',
    COORDINADOR_MTTO: 'Coordinador',
};

const ROL_COLOR = {
    TECNICO: 'bg-blue-100 text-blue-700',
    COORDINADOR_MTTO: 'bg-amber-100 text-amber-700',
};

// ── Badge de carga de trabajo ─────────────────────────────────────────────
const WorkloadBadge = ({ label, count, colorClass }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${colorClass}`}>
        <span className="font-extrabold tabular-nums">{count}</span>
        <span className="font-medium opacity-80">{label}</span>
    </span>
);

// ── Tarjeta de técnico con avatar y workload ──────────────────────────────
const TecnicoCard = ({ usuario, isSelected, onToggle }) => {
    const { workload } = usuario;
    const sinTareas = !workload ||
        (workload.asignadas === 0 && workload.enProgreso === 0 && workload.enPausa === 0);

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl border-2 text-left
                transition-all duration-150 cursor-pointer active:scale-[0.98]
                ${isSelected
                    ? 'bg-marca-primario/5 border-marca-primario shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
            `}
        >
            {/* Avatar */}
            {usuario.imagen ? (
                <img
                    src={usuario.imagen}
                    alt={usuario.nombre}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/img/perfil-no-foto.webp';
                    }}
                />
            ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${isSelected ? 'bg-marca-primario text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {usuario.nombre?.charAt(0).toUpperCase() ?? '?'}
                </div>
            )}

            {/* Nombre + rol + workload */}
            <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold leading-tight truncate ${isSelected ? 'text-marca-primario' : 'text-slate-800'}`}>
                        {usuario.nombre}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${ROL_COLOR[usuario.rol] ?? 'bg-slate-100 text-slate-600'}`}>
                        {ROL_LABEL[usuario.rol] ?? usuario.rol}
                    </span>
                </div>

                {usuario.cargo && (
                    <span className={`text-[11px] truncate ${isSelected ? 'text-marca-primario/70' : 'text-slate-400'}`}>
                        {usuario.cargo}
                    </span>
                )}

                {/* Workload */}
                {sinTareas ? (
                    <span className="text-[10px] text-slate-400 italic">Sin tareas activas</span>
                ) : (
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {workload.asignadas > 0 && (
                            <WorkloadBadge label="Asig." count={workload.asignadas} colorClass="bg-estado-asignada/10 text-estado-asignada" />
                        )}
                        {workload.enProgreso > 0 && (
                            <WorkloadBadge label="Progreso" count={workload.enProgreso} colorClass="bg-estado-en-progreso/10 text-estado-en-progreso" />
                        )}
                        {workload.enPausa > 0 && (
                            <WorkloadBadge label="Pausa" count={workload.enPausa} colorClass="bg-estado-en-pausa/10 text-estado-en-pausa" />
                        )}
                    </div>
                )}
            </div>

            {/* Check */}
            <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected ? 'bg-marca-primario border-marca-primario' : 'border-slate-300 bg-white'}`}>
                {isSelected && <Icon name="check" size="xs" className="text-white" />}
            </div>
        </button>
    );
};

// ── Modal principal ───────────────────────────────────────────────────────
export const TicketAssignModal = ({
    isOpen,
    onClose,
    ticket,
    tecnicos = [],
    onConfirm,
    isSubmitting,
}) => {
    const [seleccionados, setSeleccionados] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);
    const [tiempoEstimadoMins, setTiempoEstimadoMins] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');

    const usuariosFiltrados = useMemo(() => {
        const filtrados = tecnicos.filter((t) =>
            t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (t.cargo ?? '').toLowerCase().includes(busqueda.toLowerCase())
        );

        // Ordenar: seleccionados primero, luego por carga de trabajo (menos primero), luego nombre
        return filtrados.sort((a, b) => {
            const aSelected = seleccionados.includes(String(a.id));
            const bSelected = seleccionados.includes(String(b.id));
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;

            // Secundario: menor carga de trabajo primero
            const aTotalWork = (a.workload?.asignadas ?? 0) + (a.workload?.enProgreso ?? 0) + (a.workload?.enPausa ?? 0);
            const bTotalWork = (b.workload?.asignadas ?? 0) + (b.workload?.enProgreso ?? 0) + (b.workload?.enPausa ?? 0);
            if (aTotalWork !== bTotalWork) return aTotalWork - bTotalWork;

            return a.nombre.localeCompare(b.nombre);
        });
    }, [tecnicos, busqueda, seleccionados]);

    const totalSeleccionados = seleccionados.length;

    useEffect(() => {
        if (isOpen && ticket) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSeleccionados(ticket.responsables?.map((r) => String(r.id)) ?? []);
            setBusqueda('');
            setError(null);
            setTiempoEstimadoMins(ticket.tiempoEstimado ? String(ticket.tiempoEstimado) : '');
            setHoraInicio(ticket.horaInicioProgramada ? isoToLocalMXTime(ticket.horaInicioProgramada) : '');
            setHoraFin(ticket.horaFinProgramada ? isoToLocalMXTime(ticket.horaFinProgramada) : '');
        }
    }, [isOpen, ticket]);

    if (!ticket) return null;

    const handleToggle = (id) => {
        const idStr = String(id);
        setSeleccionados((prev) =>
            prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
        );
        setError(null);
    };

    const handleSubmit = () => {
        const fechaVencimientoStr = isoToDateInput(ticket.fechaVencimiento);
        const debeUsarRango = esFechaHoyOManana(fechaVencimientoStr);
        const tieneInicio = Boolean(horaInicio);
        const tieneFin = Boolean(horaFin);

        if (debeUsarRango && (tieneInicio || tieneFin)) {
            if (!tieneInicio || !tieneFin) {
                setError('Completa inicio y fin, o deja el rango vacío.');
                return;
            }
            if (horaFin <= horaInicio) {
                setError('La hora final debe ser mayor que la hora inicial.');
                return;
            }
        }

        const formData = new FormData();
        seleccionados.forEach((id) => formData.append('responsables', id));
        if (debeUsarRango && horaInicio && horaFin && fechaVencimientoStr) {
            const inicioIso = localMXTimeToISO(fechaVencimientoStr, horaInicio);
            const finIso = localMXTimeToISO(fechaVencimientoStr, horaFin);
            if (inicioIso) formData.append('horaInicioProgramada', inicioIso);
            if (finIso) formData.append('horaFinProgramada', finIso);
        }
        if (!debeUsarRango && Number(tiempoEstimadoMins) > 0) {
            formData.append('tiempoEstimado', String(Number(tiempoEstimadoMins)));
        }
        onConfirm(ticket.id, formData);
    };

    const fechaVencimientoStr = isoToDateInput(ticket.fechaVencimiento);
    const mananaLocal = (() => {
        const base = new Date(`${getMinDateHoy()}T00:00:00`);
        base.setDate(base.getDate() + 1);
        return base.toLocaleDateString('en-CA');
    })();
    const esFechaHoyOManana = (dateStr) => dateStr === getMinDateHoy() || dateStr === mananaLocal;
    const mostrarRangoHorario = esFechaHoyOManana(fechaVencimientoStr);
    const fechaRelativa = ticket.fechaVencimiento ? formatFechaRelativa(ticket.fechaVencimiento) : 'Sin fecha límite';

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader
                title={`Asignar responsable — #${ticket.id}`}
                onClose={() => !isSubmitting && onClose()}
            />
            <ModalBody>
                <div className="flex flex-col gap-4">

                    {/* Resumen del ticket */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tarea</p>
                        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{ticket.titulo}</p>
                    </div>

                    {/* Programación opcional */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Tiempo opcional</p>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                    {mostrarRangoHorario
                                        ? `${fechaRelativa}: puedes indicar horario sugerido.`
                                        : 'Puedes indicar duración estimada si aplica.'}
                                </p>
                            </div>
                            <Icon name={mostrarRangoHorario ? 'schedule' : 'timer'} size="sm" className="text-slate-400 shrink-0" />
                        </div>

                        {mostrarRangoHorario ? (
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Inicio</span>
                                    <input
                                        type="time"
                                        value={horaInicio}
                                        onChange={(e) => {
                                            setHoraInicio(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Fin</span>
                                    <input
                                        type="time"
                                        value={horaFin}
                                        onChange={(e) => {
                                            setHoraFin(e.target.value);
                                            setError(null);
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
                                    />
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-slate-500">Duración estimada</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="5"
                                        value={tiempoEstimadoMins}
                                        onChange={(e) => setTiempoEstimadoMins(e.target.value)}
                                        placeholder="Sin estimar"
                                        className="w-full px-3 py-2 pr-16 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-marca-secundario/20"
                                    />
                                    <span className="absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-400">min</span>
                                </div>
                                {Number(tiempoEstimadoMins) > 0 && (
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                        {formatDurationToDaysHours(Number(tiempoEstimadoMins))}
                                    </span>
                                )}
                            </label>
                        )}
                    </div>

                    {/* Header lista */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600 font-medium">
                            {tecnicos.length === 0 ? 'No hay personal disponible.' : 'Selecciona uno o más responsables:'}
                        </p>
                        {totalSeleccionados > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-marca-primario bg-marca-primario/10 px-2.5 py-1 rounded-full">
                                <Icon name="check_circle" size="xs" />
                                {totalSeleccionados} seleccionado{totalSeleccionados > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Buscador (solo si hay muchos) */}
                    {tecnicos.length > 4 && (
                        <div className="relative">
                            <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por nombre o cargo…"
                                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-marca-secundario/20 bg-white"
                            />
                        </div>
                    )}

                    {/* Lista */}
                    {tecnicos.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-slate-400 gap-3">
                            <Icon name="engineering" size="xl" />
                            <p className="text-sm italic">No hay personal disponible en este departamento.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-0.5 custom-scrollbar">
                            {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((u) => (
                                    <TecnicoCard
                                        key={u.id}
                                        usuario={u}
                                        isSelected={seleccionados.includes(String(u.id))}
                                        onToggle={() => handleToggle(u.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">
                                    Sin resultados para "{busqueda}"
                                </p>
                            )}
                        </div>
                    )}

                    {totalSeleccionados > 0 && (
                        <button
                            type="button"
                            onClick={() => setSeleccionados([])}
                            className="text-xs text-slate-400 hover:text-red-500 transition-colors font-bold self-start"
                        >
                            Limpiar selección
                        </button>
                    )}

                    {error && <p className="text-xs text-estado-rechazado font-bold">{error}</p>}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="guardar" icon="engineering" isLoading={isSubmitting} onClick={handleSubmit}>
                    Confirmar asignación
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export { TicketAssignModal as MantenimientosAssignModal };
