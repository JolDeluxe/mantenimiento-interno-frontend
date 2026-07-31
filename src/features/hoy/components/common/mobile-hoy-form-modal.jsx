// src/features/hoy/components/common/mobile-hoy-form-modal.jsx
import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { HoyActividadesForm } from '../hoy-actividades/hoy-actividades-form';
import { MobileMantenimientosFormModal } from '@/features/mantenimientos/components/common/mobile-mantenimientos-form-modal';

export const MobileHoyFormModal = (props) => {
    const { isOpen, onClose, scope, ticketAEditar } = props;
    
    const [createType, setCreateType] = useState(null);
    const [createClasificacion, setCreateClasificacion] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setCreateType(null);
            setCreateClasificacion(null);
        }
    }, [isOpen]);

    const esEdicion = Boolean(ticketAEditar);
    const esMantenimiento = esEdicion
        ? (ticketAEditar.clasificacion === 'PREVENTIVO' || ticketAEditar.clasificacion === 'CORRECTIVO')
        : null;

    if (esEdicion) {
        if (esMantenimiento) {
            return <MobileMantenimientosFormModal {...props} scope={scope || "mantenimientos"} />;
        }
        return <HoyActividadesForm {...props} isMobile={true} />;
    }

    // Si es creación, mostrar selector si no se ha elegido el tipo
    if (isOpen && !createType) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
                <ModalHeader title="Nueva tarea" onClose={onClose} />
                <ModalBody className="space-y-3 p-4">
                    <button
                        type="button"
                        onClick={() => setCreateType('actividad')}
                        className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-left hover:border-marca-primario hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <span className="h-10 w-10 rounded-lg bg-marca-primario/10 text-marca-primario flex items-center justify-center">
                            <Icon name="event_note" size="24px" />
                        </span>
                        <span>
                            <span className="block font-bold text-slate-900 font-sans">Actividad</span>
                            <span className="block text-sm text-slate-500 font-sans">Tarea planeada o extraordinaria.</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setCreateType('mantenimiento')}
                        className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-left hover:border-marca-primario hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <span className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <Icon name="precision_manufacturing" size="24px" />
                        </span>
                        <span>
                            <span className="block font-bold text-slate-900 font-sans">Mantenimiento</span>
                            <span className="block text-sm text-slate-500 font-sans">Mantenimiento ligado a maquinaria.</span>
                        </span>
                    </button>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancelar" onClick={onClose}>Cancelar</Button>
                </ModalFooter>
            </Modal>
        );
    }

    if (isOpen && createType === 'mantenimiento' && !createClasificacion) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
                <ModalHeader title="Tipo de mantenimiento" onClose={onClose} />
                <ModalBody className="space-y-3 p-4">
                    <button
                        type="button"
                        onClick={() => setCreateClasificacion('PREVENTIVO')}
                        className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-left hover:border-marca-primario hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <span className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                            <Icon name="build_circle" size="24px" />
                        </span>
                        <span>
                            <span className="block font-bold text-slate-900 font-sans">Preventivo</span>
                            <span className="block text-sm text-slate-500 font-sans">Mantenimiento programado.</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setCreateClasificacion('CORRECTIVO')}
                        className="w-full flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-left hover:border-marca-primario hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <span className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                            <Icon name="report_problem" size="24px" />
                        </span>
                        <span>
                            <span className="block font-bold text-slate-900 font-sans">Correctivo</span>
                            <span className="block text-sm text-slate-500 font-sans">Mantenimiento por falla o atención.</span>
                        </span>
                    </button>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancelar" onClick={() => setCreateType(null)}>Volver</Button>
                </ModalFooter>
            </Modal>
        );
    }

    if (isOpen && createType === 'actividad') {
        return <HoyActividadesForm {...props} isMobile={true} onClose={onClose} />;
    }

    if (isOpen && createType === 'mantenimiento' && createClasificacion) {
        return (
            <MobileMantenimientosFormModal
                {...props}
                scope="mantenimientos"
                defaultClasificacion={createClasificacion}
                onClose={onClose}
            />
        );
    }

    return null;
};
