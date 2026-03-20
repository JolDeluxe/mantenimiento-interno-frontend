import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui/z_index';
import { Input, Select } from '@/components/form/z_index';

export const TicketFormModal = ({ isOpen, onClose, onSubmit, isMutating, isAdmin }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        prioridad: 'MEDIA',
        clasificacion: 'CORRECTIVO',
        planta: '',
        area: '',
        categoria: ''
    });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader title="Crear Nueva Tarea / Reporte" onClose={onClose} />
                <ModalBody className="flex flex-col gap-4">
                    <Input label="Título del problema" name="titulo" required value={formData.titulo} onChange={handleChange} />

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input label="Planta" name="planta" required value={formData.planta} onChange={handleChange} />
                        </div>
                        <div className="flex-1">
                            <Input label="Área / Línea" name="area" required value={formData.area} onChange={handleChange} />
                        </div>
                    </div>

                    <Select
                        label="Categoría del equipo"
                        name="categoria"
                        required
                        value={formData.categoria}
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            { value: 'Electrico', label: 'Eléctrico' },
                            { value: 'Mecanico', label: 'Mecánico' },
                            { value: 'Infraestructura', label: 'Infraestructura' }
                        ]}
                    />

                    {isAdmin && (
                        <Select
                            label="Prioridad (Admin)"
                            name="prioridad"
                            value={formData.prioridad}
                            onChange={handleChange}
                            options={[
                                { value: 'BAJA', label: 'Baja' },
                                { value: 'MEDIA', label: 'Media' },
                                { value: 'ALTA', label: 'Alta' },
                                { value: 'CRITICA', label: 'Crítica (Detiene Producción)' }
                            ]}
                        />
                    )}

                    <Input
                        label="Descripción detallada"
                        name="descripcion"
                        multiline
                        rows={4}
                        required
                        value={formData.descripcion}
                        onChange={handleChange}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variante="cancelar" onClick={onClose} disabled={isMutating}>Cancelar</Button>
                    <Button type="submit" variante="guardar" isLoading={isMutating}>Generar Ticket</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};