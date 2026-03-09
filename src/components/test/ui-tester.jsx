import React, { useState } from 'react';
import { 
        Modal, 
        Icon, 
        ModalHeader, 
        ModalBody, 
        ModalFooter, 
        Skeleton, 
        Spinner, 
        Badge, 
        Button, 
        Card, 
        CardBody 
      } from '@/components/ui/z_index';

// Nuevos componentes de formulario
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
import { Checkbox } from '@/components/form/checkbox';

export const UiTester = () => {
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [comentario, setComentario] = useState('');
  const [usarHora, setUsarHora] = useState(false);

  const MAX_NOMBRE = 50;
  const MAX_COMENTARIO = 300;

  const handleSimularGuardado = () => {
    setSubmitted(true);
    if (!nombre.trim() || !prioridad || !comentario.trim()) return; 
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
      setSubmitted(false);
      setNombre(''); setPrioridad(''); setComentario(''); setUsarHora(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 flex flex-col gap-8 relative">
      
      {/* 1. Tokens de Color */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold border-b pb-2 text-marca-primario mb-4 flex items-center gap-2">
            <Icon name="palette" /> Auditoría de Tokens y Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge status="pendiente">Pendiente</Badge>
            <Badge status="asignada">Asignada</Badge>
            <Badge status="en-progreso">En Progreso</Badge>
            <Badge status="en-pausa">En Pausa</Badge>
            <Badge status="resuelto">Resuelto</Badge>
            <Badge status="cerrado">Cerrado</Badge>
            <Badge status="rechazado">Rechazado</Badge>
            <Badge status="cancelada">Cancelada</Badge>
          </div>
        </CardBody>
      </Card>

      {/* 2. Botones */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold border-b pb-2 text-marca-primario mb-4 flex items-center gap-2">
            <Icon name="smart_button" /> Auditoría de Botones
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="accion" icon="open_in_new" onClick={() => setIsModalOpen(true)}>
              Abrir Modal de Formulario
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 3. Comportamiento Base de Formularios (ACTUALIZADO CON NUEVOS COMPONENTES) */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold border-b pb-2 text-marca-primario mb-4 flex items-center gap-2">
            <Icon name="keyboard" /> Auditoría de Formularios (Capa Base)
          </h2>
          <div className="flex flex-col gap-4">
            <Input placeholder="Escribe el título del ticket..." />
            
            <Select>
              <option value="">Selecciona un departamento...</option>
              <option value="1">Mantenimiento Eléctrico</option>
              <option value="2">Mantenimiento Mecánico</option>
            </Select>
            
            <Input multiline placeholder="Describe el problema detalladamente..." />
          </div>
        </CardBody>
      </Card>

      {/* 4. Esqueletos */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold border-b pb-2 text-marca-primario mb-4 flex items-center gap-2">
            <Icon name="hourglass_empty" /> Carga e Interfaz
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-1/3" /><Skeleton className="h-6 w-2/3" />
              </div>
            </div>
            <div className="flex justify-center items-center">
              <Spinner size="40px" />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL CON FORMULARIO ENTERPRISE
      ────────────────────────────────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader title="NUEVA TAREA" onClose={() => setIsModalOpen(false)} />
        
        <ModalBody>
          <div className="flex flex-col gap-5">
            
            {/* INPUT: Nombre */}
            <div>
              <Label 
                hint={`${nombre.length}/${MAX_NOMBRE}`} 
                error={submitted && (!nombre.trim() || nombre.length > MAX_NOMBRE)}
              >
                Nombre de la tarea
              </Label>
              <Input 
                value={nombre}
                onChange={(e) => setNombre(e.target.value.slice(0, MAX_NOMBRE))}
                placeholder="Ej. Revisión de caldera..."
                disabled={loading}
                error={submitted && !nombre.trim()}
                helperText={submitted && !nombre.trim() ? "El nombre es obligatorio." : null}
              />
            </div>

            {/* SELECT: Prioridad */}
            <div>
              <Label error={submitted && !prioridad}>Prioridad</Label>
              <Select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                disabled={loading}
                error={submitted && !prioridad}
                helperText={submitted && !prioridad ? "Debes seleccionar una prioridad." : null}
              >
                <option value="">Selecciona la urgencia...</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </Select>
            </div>

            {/* CHECKBOX: Usar Hora */}
            <div className="bg-slate-50 p-3 rounded-sm border border-slate-100">
              <Checkbox 
                label="¿Especificar hora límite?"
                checked={usarHora}
                onChange={(e) => setUsarHora(e.target.checked)}
                disabled={loading}
              />
              <p className="text-[10px] text-slate-400 mt-1 italic ml-6">
                {usarHora ? "Se requiere entrega antes de la hora exacta." : "Se considera 'A Tiempo' hasta el final del día (23:59)."}
              </p>
            </div>

            {/* TEXTAREA: Indicaciones */}
            <div>
              <Label 
                hint={`${comentario.length}/${MAX_COMENTARIO}`}
                error={submitted && (!comentario.trim() || comentario.length > MAX_COMENTARIO)}
              >
                Indicaciones (Opcional)
              </Label>
              <Input 
                multiline
                value={comentario}
                onChange={(e) => setComentario(e.target.value.slice(0, MAX_COMENTARIO))}
                placeholder="Describe por qué se necesita esta tarea..."
                disabled={loading}
                error={submitted && !comentario.trim()}
                helperText={submitted && !comentario.trim() ? "Las indicaciones son obligatorias." : null}
              />
            </div>

          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="cancelar" disabled={loading} onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="guardar" icon="check" isLoading={loading} onClick={handleSimularGuardado}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};