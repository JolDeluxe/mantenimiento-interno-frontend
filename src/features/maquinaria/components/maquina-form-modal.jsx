import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Input, Label, Select } from '@/components/form/z_index';
import api from '@/lib/axios';
import { TIPOS_MAQUINARIA, AREAS_OPERACION, PLANTAS } from '../constants/catalogos';

const CRITICIDADES = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

const INITIAL_STATE = {
  codigo: '', nombre: '', proceso: '',
  criticidad: 'C', planta: 'KAPPA', area: '',
  descripcion: '',
  marca: '', modelo: '', numeroSerie: '',
  departamentoId: '', fechaInstalacion: ''
};

export const MaquinaFormModal = ({ isOpen, onClose, maquina = null, onSave, submitting = false }) => {
  const isEdit = !!maquina;
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDeptos, setLoadingDeptos] = useState(false);

  // Cargar departamentos del catálogo
  useEffect(() => {
    if (!isOpen) return;
    setLoadingDeptos(true);
    api.get('/api/departamentos?limit=1000')
      .then(res => setDepartamentos(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingDeptos(false));
  }, [isOpen]);

  // Inicializar formulario según modo
  useEffect(() => {
    if (!isOpen) return;
    if (maquina) {
      setFormData({
        codigo: maquina.codigo || '',
        nombre: maquina.nombre || '',
        proceso: maquina.proceso || '',
        criticidad: maquina.criticidad || 'C',
        planta: maquina.planta || 'Planta Baja',
        area: maquina.area || '',
        descripcion: maquina.descripcion || '',
        marca: maquina.marca || '',
        modelo: maquina.modelo || '',
        numeroSerie: maquina.numeroSerie || '',
        departamentoId: maquina.departamentoId ? String(maquina.departamentoId) : '',
        fechaInstalacion: maquina.fechaInstalacion ? maquina.fechaInstalacion.substring(0, 10) : ''
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [isOpen, maquina]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.codigo.trim()) errs.codigo = 'El código es obligatorio.';
    else if (!/^MBC\d{4}$/.test(formData.codigo.trim().toUpperCase())) errs.codigo = 'Formato: MBC0000 (MBC + 4 dígitos).';
    if (!formData.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!formData.proceso.trim()) errs.proceso = 'El tipo de maquinaria es obligatorio.';
    if (!formData.area.trim()) errs.area = 'El área es obligatoria.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      codigo: formData.codigo.trim().toUpperCase(),
      departamentoId: formData.departamentoId ? Number(formData.departamentoId) : null,
      fechaInstalacion: formData.fechaInstalacion || null
    };

    const result = await onSave(payload);
    if (result?.success) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario">
            <Icon name={isEdit ? 'edit' : 'precision_manufacturing'} size="sm" />
          </div>
          <span className="text-base font-black uppercase text-slate-800 tracking-tight">
            {isEdit ? 'Editar Máquina' : 'Registrar Nueva Máquina'}
          </span>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 max-h-[70dvh] overflow-y-auto custom-scrollbar space-y-5">

          {/* Banner de información de integración ERP */}
          {isEdit && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 mb-2">
              <Icon name="info" size="sm" className="text-blue-500 shrink-0" />
              <span>Los datos técnicos y operativos se actualizan automáticamente desde el ERP Magnus. Solo puedes modificar la clasificación de criticidad (ABC).</span>
            </div>
          )}

          {/* ── SECCIÓN OPERATIVA: Siempre visible ────────────────────────── */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Datos Operativos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-codigo" required>Código Interno</Label>
                <Input
                  id="maq-codigo"
                  placeholder="MBC0018"
                  value={formData.codigo}
                  onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                  disabled={isEdit}
                  error={errors.codigo}
                  className="uppercase font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-nombre" required>Nombre de Máquina</Label>
                <Input
                  id="maq-nombre"
                  placeholder="Ej. Cabina Ecológica"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  disabled={isEdit}
                  error={errors.nombre}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-proceso" required>Tipo de Maquinaria / Proceso</Label>
                {isEdit ? (
                  <Input
                    id="maq-proceso"
                    value={formData.proceso}
                    disabled
                  />
                ) : (
                  <Select
                    id="maq-proceso"
                    value={formData.proceso}
                    onChange={(e) => handleChange('proceso', e.target.value)}
                    error={errors.proceso}
                  >
                    <option value="">-- Selecciona Tipo --</option>
                    {TIPOS_MAQUINARIA.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-criticidad" required>Clasificación (A, B, C)</Label>
                <Select
                  id="maq-criticidad"
                  value={formData.criticidad}
                  onChange={(e) => handleChange('criticidad', e.target.value)}
                >
                  {CRITICIDADES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-planta" required>Planta / Piso</Label>
                {isEdit ? (
                  <Input
                    id="maq-planta"
                    value={formData.planta}
                    disabled
                  />
                ) : (
                  <Select
                    id="maq-planta"
                    value={formData.planta}
                    onChange={(e) => handleChange('planta', e.target.value)}
                    error={errors.planta}
                  >
                    <option value="">-- Selecciona Planta --</option>
                    {PLANTAS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maq-area" required>Área de Operación</Label>
                {isEdit ? (
                  <Input
                    id="maq-area"
                    value={formData.area}
                    disabled
                  />
                ) : (
                  <Select
                    id="maq-area"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    error={errors.area}
                  >
                    <option value="">-- Selecciona Área --</option>
                    {AREAS_OPERACION.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </Select>
                )}
              </div>



              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Label htmlFor="maq-descripcion">Descripción / Notas</Label>
                <textarea
                  id="maq-descripcion"
                  rows={2}
                  placeholder="Notas de operación, accesorios, mantenimiento especial..."
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  disabled={submitting}
                  className="w-full text-xs font-semibold px-4 py-2 border border-slate-200 rounded-xl focus:border-marca-primario focus:ring-1 focus:ring-marca-primario outline-none resize-none transition-all shadow-inner text-slate-700 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

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
            icon={isEdit ? 'save' : 'add_circle'}
          >
            {isEdit ? 'Guardar Cambios' : 'Registrar Máquina'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
