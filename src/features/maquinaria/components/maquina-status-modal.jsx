import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, Spinner } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

const ESTADOS = [
  { value: 'OPERATIVA', label: 'Operativa', icon: 'check_circle', desc: 'Máquina en perfectas condiciones de funcionamiento.', cls: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10' },
  { value: 'PARO_PRODUCCION', label: 'Paro Producción', icon: 'report_problem', desc: 'Detenida por falla reportada con impacto en producción.', cls: 'border-red-500/30 bg-red-500/5 text-red-700 hover:bg-red-500/10' },
  { value: 'EN_REPARACION', label: 'En Reparación', icon: 'build_circle', desc: 'Sometida a mantenimiento correctivo o preventivo.', cls: 'border-amber-500/30 bg-amber-500/5 text-amber-700 hover:bg-amber-500/10' },
  { value: 'INACTIVA', label: 'Inactiva', icon: 'pause_circle', desc: 'Fuera de uso temporal, pero en condiciones generales correctas.', cls: 'border-slate-500/30 bg-slate-500/5 text-slate-700 hover:bg-slate-500/10' },
  { value: 'BAJA', label: 'De Baja', icon: 'cancel', desc: 'Retirada permanentemente de la operación.', cls: 'border-red-500/30 bg-red-500/5 text-red-700 hover:bg-red-500/10' }
];

export const MaquinaStatusModal = ({
  isOpen,
  onClose,
  maquina = null,
  onChangeStatus,
  submitting = false
}) => {
  if (!maquina) return null;

  const handleSelectStatus = async (estado) => {
    if (estado === maquina.estado) return;
    const result = await onChangeStatus(maquina.id, estado);
    if (result?.success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario">
            <Icon name="swap_horiz" size="sm" />
          </div>
          <span className="text-base font-black uppercase text-slate-800 tracking-tight">
            Cambiar Estado
          </span>
        </div>
      </ModalHeader>

      <ModalBody className="p-6 space-y-4">
        <p className="text-xs text-slate-500 font-medium">
          Selecciona el nuevo estado operativo para la máquina <span className="font-bold text-slate-700">{maquina.codigo} ({maquina.nombre})</span>.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {ESTADOS.map((est) => {
            const isCurrent = maquina.estado === est.value;
            return (
              <button
                key={est.value}
                type="button"
                onClick={() => handleSelectStatus(est.value)}
                disabled={submitting || isCurrent}
                className={cn(
                  "flex items-start gap-4 p-4 border rounded-xl text-left transition-all relative overflow-hidden",
                  est.cls,
                  isCurrent && "ring-2 ring-marca-primario border-transparent",
                  (submitting || isCurrent) && "opacity-60 cursor-not-allowed"
                )}
              >
                <Icon name={est.icon} className="mt-0.5 shrink-0" size="md" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black uppercase tracking-tight">{est.label}</span>
                  <span className="text-xs font-semibold text-slate-500">{est.desc}</span>
                </div>
                {isCurrent && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-black uppercase bg-marca-primario text-white px-2 py-0.5 rounded shadow-sm">
                    <Icon name="check" size="xxs" /> Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ModalBody>

      <ModalFooter className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
          className="font-bold text-xs uppercase"
        >
          Cancelar
        </Button>
        {submitting && (
          <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
            <Spinner size="xs" /> Actualizando...
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};
