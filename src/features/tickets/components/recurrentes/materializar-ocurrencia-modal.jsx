import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/z_index';
import { fecha, getOccurrenceDate } from './recurrentes-utils';

export const MaterializarOcurrenciaModal = ({ regla, isOpen, submitting, error, onClose, onConfirm }) => {
    const fechaObjetivo = getOccurrenceDate(regla?.occurrence) || regla?.proximaFechaEjecucion;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-md">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="add_task" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">Generar tarea</span>
                </div>
            </ModalHeader>
            <ModalBody className="space-y-3">
                <p className="text-sm font-semibold text-slate-600">Se creara una tarea normal de Actividades para este ciclo.</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-black uppercase text-slate-500">Actividad</div>
                    <div className="text-sm font-black text-slate-800">{regla?.titulo || '-'}</div>
                    <div className="mt-2 text-[10px] font-black uppercase text-slate-500">Fecha programada</div>
                    <div className="text-sm font-black text-slate-800">{fecha(fechaObjetivo)}</div>
                </div>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            </ModalBody>
            <ModalFooter>
                <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="button" variant="guardar" onClick={onConfirm} disabled={submitting} isLoading={submitting}>
                    Generar tarea
                </Button>
            </ModalFooter>
        </Modal>
    );
};
