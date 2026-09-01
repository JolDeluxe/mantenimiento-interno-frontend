import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';

const copy = {
    pausar: ['Pausar regla', 'La regla dejara de generar nuevas tareas.', 'pause_circle', 'guardar'],
    reactivar: ['Reactivar regla', 'La regla volvera a generar tareas cuando corresponda.', 'play_circle', 'guardar'],
    cancelar: ['Cancelar recurrencia', 'Esta recurrencia dejara de generar nuevas tareas y desaparecera del listado activo. Las tareas e historial existentes se conservaran.', 'archive', 'borrar'],
    restaurar: ['Restaurar regla', 'La regla se restaurara en estado pausado.', 'restore', 'guardar'],
};

export const RecurrenteLifecycleModal = ({ regla, action, isOpen, submitting, error, onClose, onConfirm }) => {
    const [title, description, icon, variant] = copy[action] || copy.pausar;
    const isCancelAction = action === 'cancelar';
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name={icon} className="text-marca-primario" />
                    <span className="font-bold text-slate-800">{title}</span>
                </div>
            </ModalHeader>
            <ModalBody className="space-y-3">
                <p className="text-sm font-semibold text-slate-600">{description}</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-black uppercase text-slate-500">Actividad recurrente</div>
                    <div className="text-sm font-black text-slate-800">{regla?.titulo || '-'}</div>
                </div>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            </ModalBody>
            <ModalFooter>
                <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="button" variant={variant} icon={isCancelAction ? 'archive' : undefined} onClick={onConfirm} disabled={submitting} isLoading={submitting}>
                    {isCancelAction ? 'Cancelar recurrencia' : 'Confirmar'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
