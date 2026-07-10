import { Icon, Modal, ModalBody, ModalHeader } from '@/components/ui/z_index';
import { formatearFechaTextoLargo } from '../../helpers/fechas';
import { RecurrenteStatusBadge } from './recurrente-status-badge';
import { frecuenciaLabel } from './recurrentes-utils';

const datePart = (value) => value ? String(value).split('T')[0] : '';

export const RecurrenteDetailModal = ({ regla, isOpen, onClose }) => {
    if (!regla) return null;

    const fields = [
        ['Maquina', `${regla.maquina?.codigo || '-'} · ${regla.maquina?.nombre || '-'}`],
        ['Ubicacion', `${regla.maquina?.planta || '-'} / ${regla.maquina?.area || '-'}`],
        ['Responsable', regla.tecnicoResponsable?.nombre || '-'],
        ['Frecuencia', frecuenciaLabel(regla)],
        ['Proxima ejecucion', formatearFechaTextoLargo(datePart(regla.proximaFechaEjecucion)) || '-'],
        ['Prioridad', regla.prioridad || '-'],
        ['Tiempo estimado', regla.tiempoEstimado ? `${regla.tiempoEstimado} min` : '-'],
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <Icon name="event_repeat" className="text-marca-primario" />
                    <span className="font-bold text-slate-800">Detalle regla recurrente</span>
                </div>
            </ModalHeader>
            <ModalBody className="space-y-4 p-5">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black uppercase text-slate-800">{regla.titulo}</h3>
                        <RecurrenteStatusBadge activo={regla.activo} />
                    </div>
                    {regla.descripcion && (
                        <p className="text-sm font-medium leading-relaxed text-slate-500">{regla.descripcion}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {fields.map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div>
                            <div className="text-sm font-bold text-slate-700">{value}</div>
                        </div>
                    ))}
                </div>
            </ModalBody>
        </Modal>
    );
};
