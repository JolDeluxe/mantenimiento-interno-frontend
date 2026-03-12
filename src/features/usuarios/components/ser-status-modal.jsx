// src/features/usuarios/components/user-status-modal.jsx
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Icon } from '@/components/ui/z_index';

export const UserStatusModal = ({
    isOpen,
    onClose,
    onConfirm,
    usuario,
    submitting,
}) => {
    if (!usuario) return null;

    const esActivo = usuario.estatus === 'ACTIVO';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalHeader onClose={onClose}>
                {esActivo ? 'Confirmar Desactivación' : 'Confirmar Reactivación'}
            </ModalHeader>

            <ModalBody>
                <div className="flex flex-col items-center gap-5 py-2">
                    {/* Ícono semántico */}
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center
              ${esActivo ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-estado-resuelto'}`}
                    >
                        <Icon name={esActivo ? 'warning' : 'check_circle'} size="xl" fill />
                    </div>

                    {/* Texto */}
                    <p className="text-sm text-slate-600 text-center leading-relaxed">
                        ¿Seguro que deseas{' '}
                        <span className={`font-extrabold ${esActivo ? 'text-amber-700' : 'text-estado-resuelto'}`}>
                            {esActivo ? 'DESACTIVAR' : 'REACTIVAR'}
                        </span>{' '}
                        al usuario?
                    </p>

                    {/* Tarjeta de identidad */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="font-extrabold text-slate-900 text-base">{usuario.nombre}</p>
                        <p className="text-xs text-slate-500 font-codigo mt-1">@{usuario.username}</p>
                    </div>

                    {/* Advertencia solo en desactivar */}
                    {esActivo && (
                        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                            <Icon name="info" size="sm" className="text-estado-rechazado shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 font-medium leading-snug">
                                El usuario perderá acceso inmediato al sistema.
                            </p>
                        </div>
                    )}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="cancelar" onClick={onClose} disabled={submitting}>
                    Cancelar
                </Button>
                <Button
                    variant={esActivo ? 'borrar' : 'guardar'}
                    icon={esActivo ? 'person_off' : 'person_check'}
                    onClick={onConfirm}
                    isLoading={submitting}
                    disabled={submitting}
                >
                    {esActivo ? 'Sí, desactivar' : 'Sí, reactivar'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};