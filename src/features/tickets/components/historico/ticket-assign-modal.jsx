import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui/z_index';
import { SearchableSelect } from '@/components/ui/searchable-select';

export const TicketAssignModal = ({ isOpen, onClose, ticket, tecnicos, onAssign, isMutating }) => {
    const [responsableId, setResponsableId] = useState(null);

    useEffect(() => {
        if (isOpen) setResponsableId(null);
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (responsableId) {
            // El backend espera array de responsables según Zod: responsables: [id]
            onAssign(ticket.id, { responsables: [responsableId] });
        }
    };

    // Mapeo adaptativo para SearchableSelect
    const opcionesTecnicos = tecnicos.map(t => ({ value: t.id, label: `${t.nombre} ${t.apellidos}` }));

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader title={`Asignar Técnico - #${ticket?.id}`} onClose={onClose} />
                <ModalBody className="min-h-[250px]">
                    <p className="text-sm text-slate-600 mb-4">
                        Selecciona al técnico responsable de atender la falla: <strong>{ticket?.titulo}</strong>
                    </p>
                    <SearchableSelect
                        label="Técnico Responsable"
                        options={opcionesTecnicos}
                        value={responsableId}
                        onChange={setResponsableId}
                        placeholder="Buscar por nombre..."
                    />
                </ModalBody>
                <ModalFooter>
                    <Button type="button" variante="cancelar" onClick={onClose} disabled={isMutating}>
                        Cancelar
                    </Button>
                    <Button type="submit" variante="guardar" isLoading={isMutating} disabled={!responsableId}>
                        Confirmar Asignación
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};