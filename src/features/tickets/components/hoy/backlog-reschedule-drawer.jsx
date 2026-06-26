import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { Icon } from '@/components/ui/z_index';
import { getMinDateHoy, formatFecha, fechaInputToISOLocal } from '@/lib/date';
import { rescheduleTicketsBatch } from '../../api/tickets-api';
import { cn } from '@/utils/cn';

export const BacklogRescheduleDrawer = ({
    isOpen,
    onClose,
    ticketsAtrasados = [],
    onSuccessSincronizacion
}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivo, setMotivo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hoyLocal = getMinDateHoy();

    // Reset when drawer opens/closes or tickets change
    useEffect(() => {
        if (isOpen) {
            setSelectedIds([]);
            setNuevaFecha('');
            setMotivo('');
            setIsSubmitting(false);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const allSelected = ticketsAtrasados.length > 0 && selectedIds.length === ticketsAtrasados.length;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(ticketsAtrasados.map(t => t.id));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0 || !nuevaFecha || motivo.length < 5) return;

        setIsSubmitting(true);
        try {
            await rescheduleTicketsBatch({
                ticketIds: selectedIds,
                nuevaFecha: fechaInputToISOLocal(nuevaFecha),
                motivo
            });
            toast.success(`Se reprogramaron exitosamente ${selectedIds.length} tareas.`);
            if (onSuccessSincronizacion) {
                await onSuccessSincronizacion();
            }
            onClose();
        } catch (error) {
            console.error('Error al reprogramar backlog:', error);
            const data = error?.response?.data;
            const msg = data?.error || data?.message || 'Error al reprogramar tareas.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isButtonDisabled = selectedIds.length === 0 || !nuevaFecha || motivo.length < 5 || isSubmitting;

    return createPortal(
        <div className="fixed inset-0 z-[95] flex justify-end overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Panel Drawer */}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Cabecera Fija */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                            <Icon name="event_busy" size="sm" className="text-estado-rechazado" />
                            <span>Reprogramación de Tareas Vencidas</span>
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                            {ticketsAtrasados.length} tarea(s) vencida(s) detectada(s)
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <Icon name="close" size="sm" />
                    </button>
                </div>

                {/* Sub-cabecera */}
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 shrink-0 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-marca-primario transition-colors cursor-pointer"
                    >
                        <Icon
                            name={allSelected ? 'check_box' : 'check_box_outline_blank'}
                            size="sm"
                            className={allSelected ? 'text-marca-primario' : 'text-slate-400'}
                        />
                        <span>Seleccionar todas las {ticketsAtrasados.length} tareas</span>
                    </button>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase bg-slate-200 px-2 py-0.5 rounded-sm">
                        {selectedIds.length} Seleccionada(s)
                    </span>
                </div>

                {/* Cuerpo (Lista con scroll) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
                    {ticketsAtrasados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                            <Icon name="verified" size="xl" className="text-estado-resuelto" />
                            <p className="text-sm font-semibold">Tareas al día</p>
                            <p className="text-xs text-center max-w-xs leading-relaxed text-slate-400">
                                No se encontraron tareas atrasadas o rezagadas para reprogramar.
                            </p>
                        </div>
                    ) : (
                        ticketsAtrasados.map(ticket => {
                            const isSelected = selectedIds.includes(ticket.id);
                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => handleToggleSelect(ticket.id)}
                                    className={cn(
                                        "flex gap-3 items-start p-3 rounded-lg border text-left cursor-pointer transition-all",
                                        isSelected
                                            ? "border-marca-primario bg-marca-primario/[0.03] shadow-xs"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    )}
                                >
                                    <button
                                        type="button"
                                        className="mt-0.5 shrink-0"
                                    >
                                        <Icon
                                            name={isSelected ? 'check_box' : 'check_box_outline_blank'}
                                            size="sm"
                                            className={isSelected ? 'text-marca-primario' : 'text-slate-400'}
                                        />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                            <span>#{ticket.id}</span>
                                            {ticket.maquina?.codigo && (
                                                <>
                                                    <span>·</span>
                                                    <span className="text-slate-700 font-extrabold">{ticket.maquina.codigo}</span>
                                                </>
                                            )}
                                            <span>·</span>
                                            <span>{ticket.planta} / {ticket.area}</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug break-words">
                                            {ticket.titulo}
                                        </h4>
                                        {ticket.descripcion && ticket.descripcion !== "Sin descripción." && (
                                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words line-clamp-2">
                                                {ticket.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-black text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded uppercase">
                                        Venció {formatFecha(ticket.fechaVencimiento)}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pie fijo inferior (Sticky Footer) */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3"
                >
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Nueva Fecha de Vencimiento *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNuevaFecha(hoyLocal);
                                        setMotivo("Reprogramación masiva para el turno actual");
                                    }}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1 leading-none"
                                >
                                    ⚡ Asignar a Turno de Hoy
                                </button>
                            </div>
                            <input
                                type="date"
                                required
                                min={hoyLocal}
                                value={nuevaFecha}
                                onChange={(e) => setNuevaFecha(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Motivo del cambio de fecha *
                            </label>
                            <input
                                type="text"
                                required
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                placeholder="Ej. Cambio de prioridades en planta o saturación de turno"
                                className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-marca-secundario bg-white"
                            />
                            {motivo && motivo.length < 5 && (
                                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                                    <Icon name="error" size="xs" /> Mínimo 5 caracteres
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isButtonDisabled}
                            className={cn(
                                "w-full py-2.5 px-4 rounded text-xs font-black uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2",
                                isButtonDisabled
                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-98 cursor-pointer"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon name="sync" size="sm" className="animate-spin" />
                                    <span>Guardando cambios...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="event_repeat" size="sm" />
                                    <span>Reprogramar {selectedIds.length} tareas</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>,
        document.body
    );
};
