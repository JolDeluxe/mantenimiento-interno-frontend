import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Label, Select } from '@/components/form/z_index';

const CRITICIDADES = [
  { value: 'A', label: 'CLASE A' },
  { value: 'B', label: 'CLASE B' },
  { value: 'C', label: 'CLASE C' },
];

export const MaquinaCriticidadModal = ({ isOpen, onClose, maquina = null, onSave, submitting = false }) => {
  const [criticidad, setCriticidad] = useState('C');

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setCriticidad(maquina?.criticidad || 'C');
    });
  }, [isOpen, maquina]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSave({ criticidad });
    if (result?.success) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario">
            <Icon name="edit" size="sm" />
          </div>
          <span className="text-base font-black uppercase text-slate-800 tracking-tight">
            Editar Criticidad
          </span>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 max-h-[70dvh] overflow-y-auto custom-scrollbar space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 mb-2">
            <Icon name="info" size="sm" className="text-blue-500 shrink-0" />
            <span>Los datos técnicos y operativos de esta máquina se actualizan desde el ERP. Solo puedes modificar la clasificación de criticidad.</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Código</span>
                <span className="text-sm font-extrabold text-slate-700 font-mono">{maquina?.codigo || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre</span>
                <span className="text-sm font-extrabold text-slate-700">{maquina?.nombre || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maq-criticidad" required>Clasificación de Criticidad</Label>
              <Select
                id="maq-criticidad"
                value={criticidad}
                onChange={(e) => setCriticidad(e.target.value)}
              >
                {CRITICIDADES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="p-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl border-t border-slate-100">
          <Button
            type="button"
            variant="cancelar"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="guardar"
            isLoading={submitting}
            icon="save"
          >
            Guardar Cambios
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
