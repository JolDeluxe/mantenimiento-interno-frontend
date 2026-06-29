// src/features/tickets/components/bandeja/bandeja-filtro.jsx
import React from 'react';
import { Select } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';

export function BandejaFiltro({ totalTickets, sortOrder, onSortChange }) {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">


            {/* Contenedor del Select */}
            <div className="w-full sm:w-64">
                <Select
                    value={sortOrder}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <option value="desc">Más recientes primero</option>
                    <option value="asc">Más antiguos primero</option>
                    <option value="prioridad-desc">Mayor prioridad (Urgentes primero)</option>
                    <option value="prioridad-asc">Menor prioridad primero</option>
                </Select>
            </div>
        </div>
    );
}