import React from 'react';
import { Input, Select } from '@/components/form/z_index';
import { Button, Icon } from '@/components/ui/z_index';

export const TicketFilterBar = ({ filters, onFilterChange, onClear }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow-sm sm:flex-row sm:items-end sm:flex-wrap">
            <div className="flex-1 min-w-[200px]">
                <Input
                    label="Buscar ID o Título"
                    name="q"
                    value={filters.q || ''}
                    onChange={handleChange}
                    placeholder="Ej. Falla bomba..."
                />
            </div>

            <div className="w-full sm:w-48">
                <Select
                    label="Estado"
                    name="estado"
                    value={filters.estado || ''}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Todos los estados' },
                        { value: 'PENDIENTE', label: 'Pendiente' },
                        { value: 'ASIGNADA', label: 'Asignada' },
                        { value: 'EN_PROGRESO', label: 'En Progreso' },
                        { value: 'RESUELTO', label: 'Resuelto' }
                    ]}
                />
            </div>

            <div className="w-full sm:w-48">
                <Select
                    label="Prioridad"
                    name="prioridad"
                    value={filters.prioridad || ''}
                    onChange={handleChange}
                    options={[
                        { value: '', label: 'Todas las prioridades' },
                        { value: 'BAJA', label: 'Baja' },
                        { value: 'MEDIA', label: 'Media' },
                        { value: 'ALTA', label: 'Alta' },
                        { value: 'CRITICA', label: 'Crítica' }
                    ]}
                />
            </div>

            <Button variante="accion" onClick={onClear} className="w-full sm:w-auto h-11">
                <Icon name="filter_alt_off" className="mr-2" />
                Limpiar
            </Button>
        </div>
    );
};