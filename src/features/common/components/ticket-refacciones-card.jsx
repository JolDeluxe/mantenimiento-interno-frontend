import { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const parseRefacciones = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const getTicketRefacciones = (ticket) =>
    parseRefacciones(ticket?.refacciones)
        .map((ref) => ({
            nombre: String(ref?.nombre || '').trim(),
            cantidad: Number(ref?.cantidad) || 1,
            codigo: String(ref?.codigo || '').trim(),
        }))
        .filter((ref) => ref.nombre);

export const TicketRefaccionesCard = ({ ticket, compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const refacciones = getTicketRefacciones(ticket);
    if (refacciones.length === 0) return null;

    return (
        <div className="flex flex-col bg-amber-50/60 border border-amber-200 rounded-xl shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left cursor-pointer hover:bg-amber-100/50 transition-colors"
                aria-expanded={isOpen}
            >
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Icon name="construction" size="xs" className="text-amber-700 shrink-0" />
                    Refacciones registradas
                </span>
                <span className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black text-amber-700 bg-white/80 border border-amber-200 rounded-full px-2 py-0.5">
                        {refacciones.length}
                    </span>
                    <Icon
                        name="expand_more"
                        size="xs"
                        className={cn('text-amber-700 transition-transform', isOpen ? 'rotate-180' : '')}
                    />
                </span>
            </button>

            {isOpen && (
                <div className="border-t border-amber-200/70 px-2.5 py-2">
                    <div className={cn(
                        'max-h-52 overflow-y-auto pr-1',
                        compact ? 'flex flex-col gap-1.5' : 'grid grid-cols-1 sm:grid-cols-2 gap-1.5'
                    )}>
                        {refacciones.map((ref, index) => (
                            <div key={`${ref.nombre}-${index}`} className="bg-white border border-amber-100 rounded-lg px-2.5 py-1.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-800 leading-snug truncate">{ref.nombre}</p>
                                        {ref.codigo && (
                                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5 truncate">
                                                Código: {ref.codigo}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 shrink-0">
                                        x{ref.cantidad}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
