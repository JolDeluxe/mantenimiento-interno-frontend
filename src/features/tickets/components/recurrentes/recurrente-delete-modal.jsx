import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';

export const RecurrenteDeleteModal = ({ regla, isOpen, submitting, error, onClose, onConfirm }) => (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
        <ModalHeader onClose={onClose}>
            <div className="flex items-center gap-2">
                <Icon name="delete" className="text-red-600" />
                <span className="font-bold text-slate-800">Eliminar regla archivada</span>
            </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">
                Esta accion es fisica y el backend solo la permite cuando no compromete el historial.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase text-slate-500">Actividad recurrente</div>
                <div className="text-sm font-black text-slate-800">{regla?.titulo || '-'}</div>
            </div>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        </ModalBody>
        <ModalFooter>
            <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
            <Button type="button" variant="cancelar" onClick={onConfirm} disabled={submitting} isLoading={submitting}>Eliminar</Button>
        </ModalFooter>
    </Modal>
);
