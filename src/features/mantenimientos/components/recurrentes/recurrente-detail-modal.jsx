import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { executionStatusClass, executionStatusLabel, formatDDMM } from './matriz-utils';

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

const getOcurrenciaEstado = (item) => {
    if (item.omitida || item.ajusteTipo === 'OMITIR') {
        return 'OMITIDO';
    }
    if (item.ticketId) {
        const st = String(item.ticketEstado || '').toUpperCase();
        if (st === 'RESUELTO' || st === 'CERRADO') return 'RESUELTO';
        if (st === 'ASIGNADA') return 'ASIGNADA';
        if (st === 'EN_PROGRESO' || st === 'EN_PROCESO') return 'EN_PROGRESO';
        if (st === 'EN_PAUSA') return 'EN_PAUSA';
        if (st === 'RECHAZADO') return 'RECHAZADO';
        if (st === 'CANCELADA') return 'CANCELADA';
        return st;
    }
    
    const dateStr = item.fechaCicloLogicaFormateada || item.fechaOriginalFormateada || datePart(item.fechaCicloLogica);
    if (!dateStr) return 'PROGRAMADO_POR_RECURRENCIA';
    
    const [y, m, d] = dateStr.split('-').map(Number);
    const cicloDate = new Date(Date.UTC(y, m - 1, d));
    
    const hoy = new Date();
    const referenciaMesActual = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), 1));
    const cicloMes = new Date(Date.UTC(cicloDate.getUTCFullYear(), cicloDate.getUTCMonth(), 1));
    
    if (cicloMes.getTime() === referenciaMesActual.getTime()) {
        return 'PENDIENTE_DEL_MES';
    }
    if (cicloMes.getTime() < referenciaMesActual.getTime()) {
        return 'SIN_MANTENIMIENTO_REGISTRADO';
    }
    return 'PROGRAMADO_POR_RECURRENCIA';
};

const DataRow = ({ icon, label, value, fallback = "No registrado" }) => (
    <div className="flex gap-3 items-start">
        <div className="mt-0.5 text-slate-400">
            <Icon name={icon} size="sm" />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-slate-800 mt-0.5">
                {value || <span className="text-slate-400 italic font-normal">{fallback}</span>}
            </span>
        </div>
    </div>
);

export const RecurrenteDetailModal = ({ regla, isOpen, onClose }) => {
    if (!regla) return null;

    const listRef = useRef(null);

    const [activeTab, setActiveTab] = useState('info');
    const [ocurrencias, setOcurrencias] = useState([]);
    const [loadingOcurrencias, setLoadingOcurrencias] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [submittingAction, setSubmittingAction] = useState(false);
    const [activeAction, setActiveAction] = useState(null); // { type: 'mover' | 'omitir', originalDate: string }
    const [formData, setFormData] = useState({ fechaNueva: '', motivo: '' });

    const activeOriginalDate = activeAction?.originalDate || '';
    const isMove = activeAction?.type === 'mover';
    const motivoLimpio = formData.motivo.trim();
    const motivoMuyLargo = motivoLimpio.length > 250;
    const fechaNuevaValida = isMove ? (formData.fechaNueva && !Number.isNaN(new Date(`${formData.fechaNueva}T00:00:00`).getTime())) : true;
    const mismaFecha = isMove && formData.fechaNueva === activeOriginalDate;
    const mismoMes = isMove ? isSameMonthAndYear(activeOriginalDate, formData.fechaNueva) : true;
    const periodoCerrado = activeOriginalDate ? isPastMonth(activeOriginalDate) : false;

    const validationMessages = useMemo(() => {
        if (!activeAction) return [];
        return [
            !activeOriginalDate ? 'No se encontró la fecha programada original.' : null,
            periodoCerrado ? 'Este periodo ya cerró. No se puede mover ni omitir.' : null,
            isMove && !formData.fechaNueva ? 'Selecciona una nueva fecha programada.' : null,
            isMove && formData.fechaNueva && !fechaNuevaValida ? 'La nueva fecha no es válida.' : null,
            isMove && mismaFecha ? 'La nueva fecha debe ser diferente a la original.' : null,
            isMove && formData.fechaNueva && !mismoMes ? 'La nueva fecha debe quedar dentro del mismo mes.' : null,
            motivoLimpio.length < 3 ? 'Escribe un motivo de al menos 3 caracteres.' : null,
            motivoMuyLargo ? 'El motivo no debe pasar de 250 caracteres.' : null,
        ].filter(Boolean);
    }, [activeAction, activeOriginalDate, periodoCerrado, isMove, formData.fechaNueva, fechaNuevaValida, mismaFecha, mismoMes, motivoLimpio, motivoMuyLargo]);

    const isSubmitDisabled = submittingAction || validationMessages.length > 0;

    useEffect(() => {
        if (ocurrencias.length > 0 && activeTab === 'history') {
            setTimeout(() => {
                const today = new Date();
                const currentMonth = today.getMonth(); // 0-indexed
                let targetItem = null;
                for (const item of ocurrencias) {
                    const dateStr = item.fechaCicloLogicaFormateada || item.fechaOriginalFormateada || datePart(item.fechaCicloLogica);
                    if (!dateStr) continue;
                    const [y, m] = dateStr.split('-').map(Number);
                    if (y === selectedYear && (m - 1) === currentMonth) {
                        targetItem = item;
                        break;
                    }
                }

                if (targetItem) {
                    const origDate = targetItem.fechaOriginalFormateada || targetItem.fechaCicloLogicaFormateada || datePart(targetItem.fechaCicloLogica);
                    const el = document.getElementById(`ocurrencia-${origDate}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else if (selectedYear !== today.getFullYear()) {
                    if (listRef.current) {
                        listRef.current.scrollTop = 0;
                    }
                }
            }, 150);
        }
    }, [ocurrencias, activeTab, selectedYear]);

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
        if (validationMessages.length > 0) return;

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
        if (validationMessages.length > 0) return;

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-3xl">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">Detalle programacion preventiva</span>
                </div>
            </ModalHeader>
            <ModalBody className="space-y-4 p-6 max-h-[85vh] overflow-y-auto">
                {/* ── Tarjeta de Identidad Principal (Imitación de UserDetailModal) ── */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                    <div className="w-16 h-16 rounded-full bg-marca-primario/10 flex items-center justify-center text-marca-primario border-4 border-white shadow-md shrink-0">
                        <Icon name="event_repeat" size="lg" />
                    </div>

                    <div className="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                            {regla.titulo}
                        </h3>
                        <p className="text-slate-500 font-mono text-sm mt-1">{regla.maquina?.codigo || 'Sin código'}</p>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                            <RecurrenteStatusBadge activo={regla.activo} />
                        </div>
                    </div>
                </div>

                {/* Switcher de Vista */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl mb-4">
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

                {/* Tab: Información General (Imitación de UserDetailModal) */}
                {activeTab === 'info' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                        {regla.descripcion && (
                            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Descripción del Plan</span>
                                <p className="text-sm font-medium text-slate-750 leading-relaxed">{regla.descripcion}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                            {/* Columna Izquierda: Máquina y Ubicación */}
                            <div className="space-y-5">
                                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                    <Icon name="precision_manufacturing" size="sm" className="text-marca-primario" />
                                    Máquina y Ubicación
                                </h4>
                                <DataRow icon="settings" label="Máquina / Equipo" value={`${regla.maquina?.codigo || '-'} · ${regla.maquina?.nombre || '-'}`} />
                                <DataRow icon="location_on" label="Ubicación / Área" value={`${regla.maquina?.planta || '-'} / ${regla.maquina?.area || '-'}`} />
                                <DataRow icon="person" label="Técnico Responsable" value={regla.tecnicoResponsable?.nombre || '-'} />
                            </div>

                            {/* Columna Derecha: Planificación y Parámetros */}
                            <div className="space-y-5">
                                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                                    <Icon name="date_range" size="sm" className="text-marca-primario" />
                                    Planificación y Parámetros
                                </h4>
                                <DataRow icon="sync" label="Frecuencia de Mantenimiento" value={frecuenciaLabel(regla)} />
                                <DataRow icon="event" label="Próxima Fecha Programada" value={formatearFechaTextoLargo(datePart(regla.proximaFechaEjecucion))} />
                                <DataRow icon="warning" label="Prioridad del Trabajo" value={regla.prioridad} />
                                <DataRow icon="schedule" label="Tiempo Estimado de Paro" value={regla.tiempoEstimado ? `${regla.tiempoEstimado} min` : '-'} />
                            </div>
                        </div>
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
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
                                >
                                    <Icon name="chevron_left" size="xs" />
                                </button>
                                <span className="text-sm font-black text-slate-800 px-2">{selectedYear}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedYear(y => y + 1)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 cursor-pointer"
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
                            <div ref={listRef} className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {ocurrencias.map((item) => {
                                    const origDate = item.fechaOriginalFormateada || item.fechaCicloLogicaFormateada || datePart(item.fechaCicloLogica);
                                    const schedDate = item.fechaProgramadaFormateada || datePart(item.fechaProgramada);
                                    const periodClosed = isPastMonth(origDate);
                                    const isOmitted = item.omitida || item.ajusteTipo === 'OMITIR';
                                    const isMoved = item.movida || item.ajusteTipo === 'MOVER';
                                    const hasAjuste = isOmitted || isMoved;
                                    const hasTicket = Boolean(item.ticketId);

                                    // Obtener estado exacto como en la matriz
                                    const estado = getOcurrenciaEstado(item);
                                    const statusClasses = executionStatusClass(estado);
                                    const statusLabel = executionStatusLabel(estado);

                                    const isFormOpen = activeAction?.originalDate === origDate;

                                    return (
                                        <div
                                            key={origDate}
                                            id={`ocurrencia-${origDate}`}
                                            className={`rounded-xl border p-3.5 shadow-sm transition-all ${statusClasses} ${isFormOpen ? 'ring-2 ring-marca-secundario/20 border-marca-secundario' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-xs font-black uppercase">
                                                        {formatearFechaTextoLargo(schedDate)}
                                                    </div>
                                                    {isMoved && (
                                                        <div className="text-[10px] font-bold opacity-75 mt-0.5">
                                                            Original: {formatearFechaTextoLargo(origDate)}
                                                        </div>
                                                    )}
                                                    {item.ajusteMotivo && (
                                                        <div className="text-[10px] font-bold italic mt-1.5 bg-white/50 rounded-lg p-2 border border-black/5">
                                                            Motivo: "{item.ajusteMotivo}"
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                    <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[9px] font-black uppercase">
                                                        {statusLabel}
                                                    </span>
                                                    {hasTicket && item.ticketId && (
                                                        <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[9px] font-black uppercase">
                                                            Ticket #{item.ticketId}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Acciones para ocurrencias pendientes */}
                                            {!hasTicket && !periodClosed && !isFormOpen && (
                                                <div className="mt-3 flex items-center justify-end gap-3 border-t border-black/5 pt-2.5">
                                                    {!isOmitted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setActiveAction({ type: 'mover', originalDate: origDate });
                                                                setFormData({ fechaNueva: schedDate, motivo: item.ajusteMotivo || '' });
                                                            }}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase hover:opacity-80 cursor-pointer"
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
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase hover:opacity-80 cursor-pointer"
                                                        >
                                                            <Icon name="event_busy" size="12px" />
                                                            Omitir
                                                        </button>
                                                    )}
                                                    {hasAjuste && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(origDate)}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase hover:opacity-80 cursor-pointer text-red-700"
                                                        >
                                                            <Icon name="undo" size="12px" />
                                                            Restaurar
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Formulario Inline de Reprogramación / Omisión */}
                                            {isFormOpen && (
                                                <div className="mt-3.5 p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-inner animate-in slide-in-from-top-1 duration-150 text-slate-800">
                                                    <div className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 border-b border-slate-100 pb-1.5">
                                                        <Icon name={activeAction.type === 'mover' ? 'event_repeat' : 'event_busy'} size="12px" className="text-marca-primario" />
                                                        {activeAction.type === 'mover' ? 'Reprogramar Ocurrencia' : 'Omitir Ocurrencia'}
                                                    </div>

                                                    {activeAction.type === 'mover' && (
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold uppercase text-slate-500">Nueva Fecha Programada</label>
                                                            <input
                                                                type="date"
                                                                value={formData.fechaNueva}
                                                                onChange={(e) => setFormData(prev => ({ ...prev, fechaNueva: e.target.value }))}
                                                                className={`h-[36px] w-full rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario/20 ${formData.fechaNueva && (!fechaNuevaValida || !mismoMes || mismaFecha) ? 'border-red-400' : 'border-slate-250'}`}
                                                            />
                                                            {formData.fechaNueva && !fechaNuevaValida && (
                                                                <span className="text-[10px] font-bold text-red-600 block mt-0.5">* La fecha no es válida.</span>
                                                            )}
                                                            {formData.fechaNueva && mismaFecha && (
                                                                <span className="text-[10px] font-bold text-red-600 block mt-0.5">* Debe ser diferente a la fecha original.</span>
                                                            )}
                                                            {formData.fechaNueva && fechaNuevaValida && !mismoMes && (
                                                                <span className="text-[10px] font-bold text-red-600 block mt-0.5">* Debe quedar dentro del mismo mes.</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold uppercase text-slate-500">Motivo Obligatorio</label>
                                                        <textarea
                                                            rows={2}
                                                            value={formData.motivo}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                                                            placeholder="Ej. Por falta de refacción o paro general de planta..."
                                                            className={`w-full rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario/20 ${formData.motivo.length > 0 && motivoLimpio.length < 3 ? 'border-red-400' : 'border-slate-250'}`}
                                                        />
                                                        {formData.motivo.length > 0 && motivoLimpio.length < 3 && (
                                                            <span className="text-[10px] font-bold text-red-650 block mt-0.5">* Escribe un motivo de al menos 3 caracteres.</span>
                                                        )}
                                                        {motivoMuyLargo && (
                                                            <span className="text-[10px] font-bold text-red-650 block mt-0.5">* El motivo no debe pasar de 250 caracteres.</span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 justify-end pt-1">
                                                        <button
                                                            type="button"
                                                            disabled={submittingAction}
                                                            onClick={() => setActiveAction(null)}
                                                            className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-650 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isSubmitDisabled}
                                                            onClick={() => activeAction.type === 'mover' ? handleSaveMove(origDate) : handleSaveSkip(origDate)}
                                                            className="px-3 py-1.5 text-[10px] font-black uppercase text-white bg-estado-resuelto rounded-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
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
