import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon, Modal, ModalBody, ModalHeader, Spinner } from '@/components/ui/z_index';
import { formatearFechaTextoLargo } from '../../helpers/fechas';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { frecuenciaLabel } from './recurrentes-utils';
import { notify } from '@/components/notification/adaptive-notify';
import {
    getProyeccionRegla,
    moverOcurrencia,
    omitirOcurrencia,
    quitarAjusteOcurrencia,
} from '../../api/recurrencias-api';

const datePart = (value) => value ? String(value).split('T')[0] : '';

const isPastMonth = (fecha) => {
    if (!fecha) return false;
    const date = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getFullYear() < today.getFullYear()
        || (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth());
};

const getYearMonth = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[0]}-${parts[1]}`;
};

const isSameMonthAndYear = (str1, str2) => {
    return getYearMonth(str1) === getYearMonth(str2);
};

const getStatusBadgeStyle = (status) => {
    switch (status) {
        case 'PENDIENTE':
            return 'bg-slate-50 text-slate-700 border-slate-200';
        case 'ASIGNADA':
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'EN_PROGRESO':
        case 'EN_PROCESO':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'EN_PAUSA':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'RESUELTO':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'RECHAZADO':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'CERRADO':
            return 'bg-slate-100 text-slate-800 border-slate-300';
        case 'CANCELADA':
            return 'bg-slate-100 text-slate-400 border-slate-200 line-through';
        default:
            return 'bg-slate-50 text-slate-500 border-slate-200';
    }
};

export const RecurrenteDetailModal = ({ regla, isOpen, onClose }) => {
    if (!regla) return null;

    const [activeTab, setActiveTab] = useState('info');
    const [ocurrencias, setOcurrencias] = useState([]);
    const [loadingOcurrencias, setLoadingOcurrencias] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [submittingAction, setSubmittingAction] = useState(false);
    const [activeAction, setActiveAction] = useState(null); // { type: 'mover' | 'omitir', originalDate: string }
    const [formData, setFormData] = useState({ fechaNueva: '', motivo: '' });

    const fetchOcurrencias = useCallback(async () => {
        setLoadingOcurrencias(true);
        try {
            const res = await getProyeccionRegla(regla.id, { year: selectedYear });
            setOcurrencias(res?.data || res || []);
        } catch (err) {
            notify.error('Error al cargar ocurrencias.');
        } finally {
            setLoadingOcurrencias(false);
        }
    }, [regla.id, selectedYear]);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchOcurrencias();
            setActiveAction(null);
        }
    }, [isOpen, activeTab, fetchOcurrencias]);

    const handleSaveMove = async (originalDate) => {
        if (!formData.fechaNueva) {
            notify.error('Por favor selecciona una fecha programada.');
            return;
        }
        if (!isSameMonthAndYear(originalDate, formData.fechaNueva)) {
            notify.error('La nueva fecha debe quedar en el mismo mes.');
            return;
        }
        if (originalDate === formData.fechaNueva) {
            notify.error('La fecha programada debe ser distinta a la original.');
            return;
        }
        if (formData.motivo.trim().length < 3) {
            notify.error('Por favor escribe un motivo de al menos 3 caracteres.');
            return;
        }

        setSubmittingAction(true);
        try {
            await moverOcurrencia(regla.id, {
                fechaOriginal: originalDate,
                fechaNueva: formData.fechaNueva,
                motivo: formData.motivo.trim()
            });
            notify.success('Ocurrencia reprogramada con éxito.');
            setActiveAction(null);
            fetchOcurrencias();
        } catch (err) {
            notify.error(err?.response?.data?.error || 'Error al mover ocurrencia.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleSaveSkip = async (originalDate) => {
        if (formData.motivo.trim().length < 3) {
            notify.error('Por favor escribe un motivo de al menos 3 caracteres.');
            return;
        }

        setSubmittingAction(true);
        try {
            await omitirOcurrencia(regla.id, {
                fechaOriginal: originalDate,
                motivo: formData.motivo.trim()
            });
            notify.success('Ocurrencia omitida con éxito.');
            setActiveAction(null);
            fetchOcurrencias();
        } catch (err) {
            notify.error(err?.response?.data?.error || 'Error al omitir ocurrencia.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleRemove = async (originalDate) => {
        if (!window.confirm('¿Deseas restaurar esta ocurrencia a su fecha original?')) return;
        setSubmittingAction(true);
        try {
            await quitarAjusteOcurrencia(regla.id, { fechaOriginal: originalDate });
            notify.success('Ajuste removido con éxito.');
            fetchOcurrencias();
        } catch (err) {
            notify.error(err?.response?.data?.error || 'Error al remover ajuste.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const infoFields = [
        { label: 'Máquina', value: `${regla.maquina?.codigo || '-'} · ${regla.maquina?.nombre || '-'}`, icon: 'precision_manufacturing', color: 'text-blue-600 bg-blue-50' },
        { label: 'Ubicación', value: `${regla.maquina?.planta || '-'} / ${regla.maquina?.area || '-'}`, icon: 'location_on', color: 'text-indigo-600 bg-indigo-50' },
        { label: 'Responsable', value: regla.tecnicoResponsable?.nombre || '-', icon: 'person', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Frecuencia', value: frecuenciaLabel(regla), icon: 'sync', color: 'text-purple-600 bg-purple-50' },
        { label: 'Próxima Programación', value: formatearFechaTextoLargo(datePart(regla.proximaFechaEjecucion)) || '-', icon: 'event', color: 'text-amber-600 bg-amber-50' },
        { label: 'Prioridad', value: regla.prioridad || '-', icon: 'warning', color: 'text-red-600 bg-red-50 border border-red-100' },
        { label: 'Tiempo Estimado', value: regla.tiempoEstimado ? `${regla.tiempoEstimado} min` : '-', icon: 'schedule', color: 'text-cyan-600 bg-cyan-50' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">Detalle programacion preventiva</span>
                </div>
            </ModalHeader>
            <ModalBody className="space-y-4 p-5 max-h-[85vh] overflow-y-auto">
                {/* Cabecera Principal */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black uppercase tracking-wide text-slate-800">{regla.titulo}</h3>
                        <RecurrenteStatusBadge activo={regla.activo} />
                    </div>
                    {regla.descripcion && (
                        <p className="text-xs font-semibold leading-relaxed text-slate-500">{regla.descripcion}</p>
                    )}
                </div>

                {/* Switcher de Vista */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'info' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon name="info" size="xs" />
                        Información
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Icon name="calendar_month" size="xs" />
                        Historial y Ocurrencias
                    </button>
                </div>

                {/* Tab: Información General */}
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200">
                        {infoFields.map(({ label, value, icon, color }) => (
                            <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                                    <Icon name={icon} size="sm" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div>
                                    <div className="text-xs font-black text-slate-700 break-words truncate max-w-[200px]" title={value}>{value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab: Historial y Agenda */}
                {activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Selector de Año */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="text-xs font-black uppercase tracking-wide text-slate-500">Cronograma de Ocurrencias</div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedYear(y => y - 1)}
                                    className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
                                >
                                    <Icon name="chevron_left" size="xs" />
                                </button>
                                <span className="text-sm font-black text-slate-800 px-2">{selectedYear}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedYear(y => y + 1)}
                                    className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
                                >
                                    <Icon name="chevron_right" size="xs" />
                                </button>
                            </div>
                        </div>

                        {/* Listado de Ocurrencias */}
                        {loadingOcurrencias ? (
                            <div className="flex items-center justify-center py-12 text-slate-500">
                                <Spinner size="sm" className="mr-2" />
                                <span className="text-xs font-black uppercase tracking-wide">Cargando cronograma...</span>
                            </div>
                        ) : ocurrencias.length === 0 ? (
                            <div className="text-center py-8 text-xs font-semibold text-slate-400">
                                Sin ocurrencias proyectadas para el año {selectedYear}.
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                                {ocurrencias.map((item) => {
                                    const origDate = item.fechaOriginalFormateada || item.fechaCicloLogicaFormateada || datePart(item.fechaCicloLogica);
                                    const schedDate = item.fechaProgramadaFormateada || datePart(item.fechaProgramada);
                                    const periodClosed = isPastMonth(origDate);
                                    const isOmitted = item.omitida || item.ajusteTipo === 'OMITIR';
                                    const isMoved = item.movida || item.ajusteTipo === 'MOVER';
                                    const hasAjuste = isOmitted || isMoved;
                                    const hasTicket = Boolean(item.ticketId);

                                    // Lógica de colores de borde
                                    let borderStyle = 'border-l-4 border-l-slate-300';
                                    let statusLabel = 'Programado';
                                    let statusColor = 'bg-slate-50 text-slate-600 border-slate-200';

                                    if (hasTicket) {
                                        const term = item.ticketEstado === 'RESUELTO' || item.ticketEstado === 'CERRADO';
                                        borderStyle = term ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-blue-500';
                                        statusLabel = term ? 'Completado' : 'Mantenimiento generado';
                                        statusColor = term ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200';
                                    } else if (isOmitted) {
                                        borderStyle = 'border-l-4 border-l-slate-400';
                                        statusLabel = 'Omitido';
                                        statusColor = 'bg-slate-100 text-slate-600 border-slate-300';
                                    } else if (isMoved) {
                                        borderStyle = 'border-l-4 border-l-sky-500';
                                        statusLabel = 'Re-programado';
                                        statusColor = 'bg-sky-50 text-sky-700 border-sky-200';
                                    }

                                    const isFormOpen = activeAction?.originalDate === origDate;

                                    return (
                                        <div
                                            key={origDate}
                                            className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all ${borderStyle} ${isFormOpen ? 'ring-2 ring-marca-secundario/10' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-xs font-black uppercase text-slate-800">
                                                        {formatearFechaTextoLargo(schedDate)}
                                                    </div>
                                                    {isMoved && (
                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                            Original: {formatearFechaTextoLargo(origDate)}
                                                        </div>
                                                    )}
                                                    {item.ajusteMotivo && (
                                                        <div className="text-[10px] font-bold text-slate-500 italic mt-1 bg-slate-50 rounded-lg p-1.5 border border-slate-200/50">
                                                            Motivo: "{item.ajusteMotivo}"
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                    {hasTicket && item.ticketEstado && (
                                                        <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase ${getStatusBadgeStyle(item.ticketEstado)}`}>
                                                            Ticket: {item.ticketEstado}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Acciones para ocurrencias pendientes */}
                                            {!hasTicket && !periodClosed && !isFormOpen && (
                                                <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                                                    {!isOmitted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveAction({ type: 'mover', originalDate: origDate });
                                                                setFormData({ fechaNueva: schedDate, motivo: item.ajusteMotivo || '' });
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-sky-600 hover:text-sky-800 cursor-pointer"
                                                        >
                                                            <Icon name="event_repeat" size="12px" />
                                                            Reprogramar
                                                        </button>
                                                    )}
                                                    {!hasAjuste && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveAction({ type: 'omitir', originalDate: origDate });
                                                                setFormData({ fechaNueva: '', motivo: '' });
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 cursor-pointer"
                                                        >
                                                            <Icon name="event_busy" size="12px" />
                                                            Omitir
                                                        </button>
                                                    )}
                                                    {hasAjuste && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(origDate)}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-500 hover:text-red-700 cursor-pointer"
                                                        >
                                                            <Icon name="undo" size="12px" />
                                                            Restaurar
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Formulario Inline de Reprogramación / Omisión */}
                                            {isFormOpen && (
                                                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in slide-in-from-top-1 duration-150">
                                                    <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                                                        <Icon name={activeAction.type === 'mover' ? 'event_repeat' : 'event_busy'} size="12px" />
                                                        {activeAction.type === 'mover' ? 'Reprogramar este mes' : 'Omitir este mes'}
                                                    </div>

                                                    {activeAction.type === 'mover' && (
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase text-slate-600">Nueva Fecha Programada</label>
                                                            <input
                                                                type="date"
                                                                value={formData.fechaNueva}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, fechaNueva: e.target.value }))}
                                                                className="h-[34px] w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario/20"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase text-slate-600">Motivo Obligatorio</label>
                                                        <textarea
                                                            rows={2}
                                                            value={formData.motivo}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                                                            placeholder="Ej. Por falta de refacción o paro general de planta..."
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario/20"
                                                        />
                                                    </div>

                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            type="button"
                                                            disabled={submittingAction}
                                                            onClick={() => setActiveAction(null)}
                                                            className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={submittingAction}
                                                            onClick={() => activeAction.type === 'mover' ? handleSaveMove(origDate) : handleSaveSkip(origDate)}
                                                            className="px-2.5 py-1.5 text-[10px] font-black uppercase text-white bg-marca-primario rounded-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
                                                        >
                                                            {submittingAction ? 'Guardando...' : 'Confirmar'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};
