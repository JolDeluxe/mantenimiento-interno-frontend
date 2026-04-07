// src/features/tickets/components/bandeja/bandeja-filtro.jsx
import React from 'react';
import { Select } from '@/components/form/z_index';

export function BandejaFiltro({ totalTickets, sortOrder, onSortChange }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 sm:bg-white sm:p-4 sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-sm pt-2 pb-1 sm:pt-4 sm:pb-4">
            <div>
                {/* Título adaptable: Corto en móvil, completo en desktop */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 font-heading tracking-tight">
                    <span className="sm:hidden">Nuevos Tickets ({totalTickets})</span>
                    <span className="hidden sm:inline">Bandeja de Entrada</span>
                </h2>
                {/* Subtítulo: Solo visible en Desktop */}
                <p className="hidden sm:block text-sm text-slate-500 mt-1">
                    Mostrando <span className="font-bold text-slate-700">{totalTickets}</span> ticket{totalTickets !== 1 ? 's' : ''} sin asignar.
                </p>
            </div>

            <div className="w-full sm:w-64 shrink-0">
                <Select
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="asc">Más antiguos primero</option>
                    <option value="desc">Más recientes primero</option>
                </Select>
            </div>
        </div>
    );
}