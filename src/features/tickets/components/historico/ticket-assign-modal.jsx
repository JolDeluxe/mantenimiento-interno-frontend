// src/features/tickets/components/historico/ticket-assign-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, SearchableSelect } from '@/components/ui/z_index';
import { Label } from '@/components/form/z_index';

export const TicketAssignModal = ({
    isOpen,
    onClose,
    ticket,
    tecnicos = [],
    onConfirm,
    isSubmitting,
}) => {
    const [seleccionados, setSeleccionados] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && ticket) {
            // Pre-carga con los responsables actuales
            const ids = ticket.responsables?.map((r) => String(r.id)) ?? [];
            setSeleccionados(ids);
            setError(null);
        }
    }, [isOpen, ticket]);

    if (!ticket) return null;

    const opcionesTecnicos = tecnicos.map((t) => ({
        value: t.id,
        label: t.nombre + (t.cargo ? ` — ${t.cargo}` : ''),
    }));

    const handleToggle = (id) => {
        setSeleccionados((prev) =>
            prev.includes(String(id))
                ? prev.filter((x) => x !== String(id))
                : [...prev, String(id)]
        );
        setError(null);
    };

    const handleSubmit = () => {
        const formData = new FormData();
        seleccionados.forEach((id) => formData.append('responsables', id));
        onConfirm(ticket.id, formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()}>
            <ModalHeader title={`Asignar técnico — #${ticket.id}`} onClose={() => !isSubmitting && onClose()} />
            <ModalBody>
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Selecciona uno o más técnicos para: <span className="font-bold text-slate-800">{ticket.titulo}</span>
                    </p>

                    {opcionesTecnicos.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-4">No hay técnicos activos disponibles.</p>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                            {opcionesTecnicos.map((opt) => {
                                const isSelected = seleccionados.includes(String(opt.value));
                                return (
                                    <label
                                        key={opt.value}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
                      ${isSelected
                                                ? 'bg-marca-primario/5 border-marca-primario/30 text-marca-primario'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggle(opt.value)}
                                            className="accent-marca-primario w-4 h-4 shrink-0"
                                        />
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {error && <p className="text-xs text-estado-rechazado font-bold">{error}</p>}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button
                    variant="guardar"
                    icon="engineering"
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                >
                    Confirmar asignación
                </Button>
            </ModalFooter>
        </Modal>
    );
};