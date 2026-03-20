import React from 'react';
import { Table, Pagination, Badge } from '@/components/ui/z_index';
import { TicketStatusBadge, TicketPriorityBadge } from './ticket-status-badge';
import { TicketActions } from './ticket-actions';

const isAtrasada = (ticket) => {
    if (['RESUELTO', 'CERRADO', 'CANCELADA', 'RECHAZADO'].includes(ticket.estado)) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (ticket.fechaVencimiento) return new Date(ticket.fechaVencimiento) < new Date();
    return new Date(ticket.createdAt) < hoy;
};

export const TicketsTable = ({
    tickets,
    isLoading,
    pagination,
    onPageChange,
    userRole,
    onAssign,
    onStatusChange,
    onViewDetails
}) => {
    const headers = ["ID", "TÍTULO", "ÁREA", "PRIORIDAD", "ESTADO", "ACCIONES"];

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col w-full">
            <Table headers={headers} isLoading={isLoading} emptyMessage="No hay tickets que mostrar.">
                {tickets.map((ticket) => {
                    const rezagada = isAtrasada(ticket);
                    return (
                        <tr
                            key={ticket.id}
                            // Destello de advertencia sutil si está atrasada
                            className={`border-b border-slate-100 last:border-0 transition-colors ${rezagada ? 'bg-red-50/40 hover:bg-red-50/80' : 'hover:bg-slate-50'}`}
                        >
                            <td className="p-4 text-sm font-mono font-medium text-slate-500">
                                #{ticket.id}
                                {rezagada && <div className="mt-1"><Badge color="danger">Atrasada</Badge></div>}
                            </td>
                            <td className={`p-4 text-sm font-semibold truncate max-w-[200px] ${rezagada ? 'text-red-900' : 'text-slate-800'}`}>
                                {ticket.titulo}
                            </td>
                            <td className="p-4 text-sm text-slate-600">{ticket.area || 'N/A'}</td>
                            <td className="p-4">
                                <TicketPriorityBadge priority={ticket.prioridad} />
                            </td>
                            <td className="p-4">
                                <TicketStatusBadge status={ticket.estado} />
                            </td>
                            <td className="p-4 flex justify-end">
                                <TicketActions
                                    ticket={ticket}
                                    userRole={userRole}
                                    onAssign={onAssign}
                                    onStatusChange={onStatusChange}
                                    onViewDetails={onViewDetails}
                                />
                            </td>
                        </tr>
                    );
                })}
            </Table>

            {pagination && pagination.total > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={Math.ceil(pagination.total / pagination.limit)}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
};