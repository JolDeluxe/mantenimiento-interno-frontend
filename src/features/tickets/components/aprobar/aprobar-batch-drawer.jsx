import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { Icon } from '@/components/ui/z_index';
import { formatFecha } from '@/lib/date';
import { approveTicketsBatch } from '@/features/tickets/api/tickets-api';
import { approveMantenimientosBatch } from '@/features/mantenimientos/api/mantenimientos-api';
import { cn } from '@/utils/cn';

export const AprobarBatchDrawer = ({
    isOpen,
    onClose,
    tickets = [],
    onSuccess,
    scope = 'general'
}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [nota, setNota] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset when drawer opens/closes or tickets change
    useEffect(() => {
        if (isOpen) {
            setSelectedIds(tickets.map(t => t.id)); // select all by default
            setNota('');
            setIsSubmitting(false);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, tickets]);

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

    const allSelected = tickets.length > 0 && selectedIds.length === tickets.length;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(tickets.map(t => t.id));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;

        setIsSubmitting(true);
        try {
            // Seleccionar endpoint basado en el scope actual
            const approveFn = scope === 'mantenimientos' ? approveMantenimientosBatch : approveTicketsBatch;

            await approveFn({
                ticketIds: selectedIds,
                nota: nota.trim() || 'Aprobación rápida en lote'
            });
            
            toast.success(`Se aprobaron exitosamente ${selectedIds.length} tareas.`);
            if (onSuccess) {
                await onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Error al aprobar tareas en lote:', error);
            const data = error?.response?.data;
            const msg = data?.error || data?.message || 'Error al aprobar tareas.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isButtonDisabled = selectedIds.length === 0 || isSubmitting;

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
                            <Icon name="fact_check" size="sm" className="text-emerald-600" />
                            <span>Aprobación Rápida en Lote</span>
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                            {tickets.length} tarea(s) resuelta(s) detectada(s)
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
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                        <Icon
                            name={allSelected ? 'check_box' : 'check_box_outline_blank'}
                            size="sm"
                            className={allSelected ? 'text-emerald-600' : 'text-slate-400'}
                        />
                        <span>Seleccionar todas las {tickets.length} tareas</span>
                    </button>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-sm">
                        {selectedIds.length} Seleccionada(s)
                    </span>
                </div>

                {/* Cuerpo (Lista con scroll) */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
                    {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                            <Icon name="verified" size="xl" className="text-emerald-600" />
                            <p className="text-sm font-semibold">Sin tareas por aprobar</p>
                            <p className="text-xs text-center max-w-xs leading-relaxed text-slate-400">
                                No se encontraron tareas resueltas en espera de aprobación.
                            </p>
                        </div>
                    ) : (
                        tickets.map(ticket => {
                            const isSelected = selectedIds.includes(ticket.id);
                            return (
                                <div
                                    key={ticket.id}
                                    onClick={() => handleToggleSelect(ticket.id)}
                                    className={cn(
                                        "flex gap-3 items-start p-3 rounded-lg border text-left cursor-pointer transition-all",
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-50/10 shadow-xs"
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
                                            className={isSelected ? 'text-emerald-600' : 'text-slate-400'}
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
                                        {ticket.responsables?.length > 0 && (
                                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                                <Icon name="engineering" size="xxs" className="text-slate-400" />
                                                <span className="truncate">
                                                    {ticket.responsables.map(r => r.nombre).join(', ')}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0 text-right">
                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                                            Resuelto
                                        </span>
                                        {ticket.finalizadoAt && (
                                            <span className="text-[8px] text-slate-400 font-medium uppercase">
                                                {formatFecha(ticket.finalizadoAt)}
                                            </span>
                                        )}
                                    </div>
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
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Nota de Cierre (Opcional)
                        </label>
                        <input
                            type="text"
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Ej. Aprobación rápida masiva de fin de turno"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
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
                                    <span>Procesando aprobación...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="fact_check" size="sm" />
                                    <span>Aprobar {selectedIds.length} tareas</span>
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
