import React from 'react';
// CORRECCIÓN: Apuntando explícitamente al z_index de tu arquitectura
import { Button, Icon } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';

export const TicketCard = ({ ticket, onStatusChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100/60 relative overflow-hidden active:scale-[0.98] transition-transform">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.prioridad === 'CRITICA' ? 'bg-estado-rechazado' : 'bg-transparent'}`} />

            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono font-semibold text-slate-400">#{ticket.id}</span>
                <div className="flex gap-2">
                    <TicketPriorityBadge priority={ticket.prioridad} />
                    <TicketStatusBadge status={ticket.estado} />
                </div>
            </div>

            <h3 className="font-semibold text-slate-800 text-lg mb-1 leading-tight">{ticket.titulo}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{ticket.descripcion}</p>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                {ticket.estado === 'PENDIENTE' && (
                    <Button className="w-full h-12 rounded-xl" variante="accion" onClick={() => onStatusChange(ticket, 'EN_PROGRESO')}>
                        <Icon name="play_arrow" className="mr-2" /> Iniciar Trabajo
                    </Button>
                )}
                {ticket.estado === 'EN_PROGRESO' && (
                    <>
                        <Button className="w-1/2 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 border-none text-white" onClick={() => onStatusChange(ticket, 'EN_PAUSA')}>
                            <Icon name="pause" className="mr-1" /> Pausar
                        </Button>
                        <Button className="w-1/2 h-12 rounded-xl" variante="guardar" onClick={() => onStatusChange(ticket, 'RESUELTO')}>
                            <Icon name="check_circle" className="mr-1" /> Resolver
                        </Button>
                    </>
                )}
                {ticket.estado === 'EN_PAUSA' && (
                    <Button className="w-full h-12 rounded-xl" variante="accion" onClick={() => onStatusChange(ticket, 'EN_PROGRESO')}>
                        <Icon name="play_arrow" className="mr-2" /> Reanudar
                    </Button>
                )}
            </div>
        </div>
    );
};