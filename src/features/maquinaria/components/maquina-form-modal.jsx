import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon, Spinner } from '@/components/ui/z_index';
import { Input, Label, Select } from '@/components/form/z_index';
import api from '@/lib/axios';

const CRITICIDADES = [
  { value: 'A', label: 'Clase A (Crítica)' },
  { value: 'B', label: 'Clase B (Media)' },
  { value: 'C', label: 'Clase C (Baja)' }
];

const PLANTAS = [
  { value: 'Planta Baja', label: 'Planta Baja' },
  { value: 'Planta Alta', label: 'Planta Alta' }
];

export const MaquinaFormModal = ({
  isOpen,
  onClose,
  maquina = null,
  onSave,
  submitting = false
}) => {
  const isEdit = !!maquina;

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    proceso: '',
    descripcion: '',
    criticidad: 'C',
    marca: '',
    modelo: '',
    numeroSerie: '',
    planta: 'Planta Baja',
    area: '',
    ubicacionDetalle: '',
    departamentoId: '',
    fechaInstalacion: ''
  });

  const [errors, setErrors] = useState({});
  const [departamentos, setDepartamentos] = useState([]);
  const [loadingDeptos, setLoadingDeptos] = useState(false);

  // Cargar departamentos del catálogo
  useEffect(() => {
    if (isOpen) {
      setLoadingDeptos(true);
      api.get('/api/departamentos?limit=1000')
        .then(res => {
          setDepartamentos(res.data?.data || []);
        })
        .catch(err => {
          console.error('Error al cargar departamentos:', err);
        })
        .finally(() => {
          setLoadingDeptos(false);
        });
    }
  }, [isOpen]);

  // Inicializar formulario si estamos editando
  useEffect(() => {
    if (isOpen) {
      if (maquina) {
        setFormData({
          codigo: maquina.codigo || '',
          nombre: maquina.nombre || '',
          proceso: maquina.proceso || '',
          descripcion: maquina.descripcion || '',
          criticidad: maquina.criticidad || 'C',
          marca: maquina.marca || '',
          modelo: maquina.modelo || '',
          numeroSerie: maquina.numeroSerie || '',
          planta: maquina.planta || 'Planta Baja',
          area: maquina.area || '',
          ubicacionDetalle: maquina.ubicacionDetalle || '',
          departamentoId: maquina.departamentoId ? String(maquina.departamentoId) : '',
          fechaInstalacion: maquina.fechaInstalacion ? maquina.fechaInstalacion.substring(0, 10) : ''
        });
      } else {
        setFormData({
          codigo: '',
          nombre: '',
          proceso: '',
          descripcion: '',
          criticidad: 'C',
          marca: '',
          modelo: '',
          numeroSerie: '',
          planta: 'Planta Baja',
          area: '',
          ubicacionDetalle: '',
          departamentoId: '',
          fechaInstalacion: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, maquina]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    const regexCode = /^MBC\d{4}$/;

    if (!formData.codigo.trim()) {
      tempErrors.codigo = 'El código es obligatorio.';
    } else if (!regexCode.test(formData.codigo.trim().toUpperCase())) {
      tempErrors.codigo = 'El código debe tener el formato MBC0000 (MBC + 4 dígitos).';
    }

    if (!formData.nombre.trim()) {
      tempErrors.nombre = 'El nombre es obligatorio.';
    }
    if (!formData.proceso.trim()) {
      tempErrors.proceso = 'El proceso (tipo de máquina) es obligatorio.';
    }
    if (!formData.planta.trim()) {
      tempErrors.planta = 'La planta es obligatoria.';
    }
    if (!formData.area.trim()) {
      tempErrors.area = 'El área es obligatoria.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      codigo: formData.codigo.trim().toUpperCase(),
      departamentoId: formData.departamentoId ? Number(formData.departamentoId) : null,
      fechaInstalacion: formData.fechaInstalacion ? new Date(formData.fechaInstalacion) : null
    };

    const result = await onSave(payload);
    if (result?.success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario">
            <Icon name={isEdit ? 'edit' : 'add'} size="sm" />
          </div>
          <span className="text-base font-black uppercase text-slate-800 tracking-tight">
            {isEdit ? 'Editar Máquina' : 'Registrar Nueva Máquina'}
          </span>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalBody className="p-6 max-h-[70dvh] overflow-y-auto custom-scrollbar space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Código */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo" required>Código Interno</Label>
              <Input
                id="codigo"
                placeholder="Ej. MBC0018"
                value={formData.codigo}
                onChange={(e) => handleChange('codigo', e.target.value)}
                disabled={isEdit} // No permitir cambiar código al editar para consistencia
                error={errors.codigo}
                className="uppercase"
              />
            </div>

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre" required>Nombre de Máquina</Label>
              <Input
                id="nombre"
                placeholder="Ej. Cabina Ecológica"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                error={errors.nombre}
              />
            </div>

            {/* Proceso */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proceso" required>Tipo de Maquinaria / Proceso</Label>
              <Input
                id="proceso"
                placeholder="Ej. Pulir, Pespuntar, Cabina Ecologica"
                value={formData.proceso}
                onChange={(e) => handleChange('proceso', e.target.value)}
                error={errors.proceso}
              />
            </div>

            {/* Criticidad */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="criticidad" required>Criticidad</Label>
              <Select
                id="criticidad"
                value={formData.criticidad}
                onChange={(e) => handleChange('criticidad', e.target.value)}
              >
                {CRITICIDADES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>

            {/* Planta */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="planta" required>Planta / Piso</Label>
              <Select
                id="planta"
                value={formData.planta}
                onChange={(e) => handleChange('planta', e.target.value)}
                error={errors.planta}
              >
                {PLANTAS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>

            {/* Área */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area" required>Área de Operación</Label>
              <Input
                id="area"
                placeholder="Ej. Acabado L1, Cinturones, Pespunte"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                error={errors.area}
              />
            </div>

            {/* Ubicación Detalle */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="ubicacionDetalle">Detalle de Ubicación Física</Label>
              <Input
                id="ubicacionDetalle"
                placeholder="Ej. Planta Baja Mezannine ACC, al lado de almacén"
                value={formData.ubicacionDetalle}
                onChange={(e) => handleChange('ubicacionDetalle', e.target.value)}
              />
            </div>

            {/* Marca */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                placeholder="Ej. Singer, Pfaff"
                value={formData.marca}
                onChange={(e) => handleChange('marca', e.target.value)}
              />
            </div>

            {/* Modelo */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                placeholder="Ej. 191D-20C"
                value={formData.modelo}
                onChange={(e) => handleChange('modelo', e.target.value)}
              />
            </div>

            {/* Número de Serie */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="numeroSerie">Número de Serie</Label>
              <Input
                id="numeroSerie"
                placeholder="Ej. SN-82479213"
                value={formData.numeroSerie}
                onChange={(e) => handleChange('numeroSerie', e.target.value)}
              />
            </div>

            {/* Departamento Asignado */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="departamentoId">Departamento Propietario</Label>
              <Select
                id="departamentoId"
                value={formData.departamentoId}
                onChange={(e) => handleChange('departamentoId', e.target.value)}
                disabled={loadingDeptos}
              >
                <option value="">Ninguno...</option>
                {departamentos.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </Select>
            </div>

            {/* Fecha Instalación */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fechaInstalacion">Fecha de Instalación</Label>
              <Input
                id="fechaInstalacion"
                type="date"
                value={formData.fechaInstalacion}
                onChange={(e) => handleChange('fechaInstalacion', e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="descripcion">Descripción / Notas Adicionales</Label>
              <textarea
                id="descripcion"
                rows="3"
                placeholder="Ingresa notas sobre el estado de la máquina, mantenimiento específico o accesorios..."
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="w-full text-xs font-semibold px-4 py-2 border border-slate-200 rounded-xl focus:border-marca-primario focus:ring-1 focus:ring-marca-primario outline-none resize-none transition-all shadow-inner text-slate-700 placeholder-slate-400"
              />
            </div>

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
          <Button
            type="submit"
            disabled={submitting}
            className="bg-marca-primario hover:bg-marca-primario-oscuro text-white font-bold text-xs uppercase flex items-center gap-1.5"
          >
            {submitting ? <Spinner size="xs" color="white" /> : <Icon name="save" size="sm" />}
            {isEdit ? 'Guardar Cambios' : 'Registrar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
