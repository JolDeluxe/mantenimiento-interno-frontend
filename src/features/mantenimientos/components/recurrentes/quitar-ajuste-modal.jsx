import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';
import { formatDDMM } from './matriz-utils';

export const QuitarAjusteModal = ({
    isOpen,
    item,
    submitting,
    onClose,
    onConfirm,
}) => {
    const fechaOriginal = item?.fechaOriginal || item?.fechaInicio || '';

    const handleConfirm = () => {
        if (!fechaOriginal || submitting) return;
        onConfirm({ fechaOriginal });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <ModalHeader title="Quitar ajuste" onClose={onClose} />
            <ModalBody className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] font-black uppercase text-slate-500">Fecha programada original</div>
                    <div className="mt-0.5 text-sm font-black text-slate-800">{formatDDMM(fechaOriginal)}</div>
                </div>
                <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700">
                    Esta ocurrencia volverá a la programación base.
                </p>
            </ModalBody>
            <ModalFooter>
                <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="button" variant="guardar" onClick={handleConfirm} disabled={!fechaOriginal || submitting} isLoading={submitting}>
                    Volver a programación base
                </Button>
            </ModalFooter>
        </Modal>
    );
};
