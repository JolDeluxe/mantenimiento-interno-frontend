import { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from "@/components/ui/z_index";
import { Select } from "@/components/form/z_index";
import { getBajaImpacto } from "../api/users-api";
import { toast } from "react-toastify";

export const UserStatusModal = ({ isOpen, onClose, onConfirm, usuario, isSubmitting }) => {
  if (!usuario) return null;

  const estadoActual = usuario.estado || usuario.estatus;
  const esActivo = estadoActual === "ACTIVO";
  const esTecnico = usuario.rol === "TECNICO";

  // State for deactivation wizard
  const [step, setStep] = useState(1);
  const [impact, setImpact] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  // Mappings: id -> replacementTechId
  const [tareasReasignaciones, setTareasReasignaciones] = useState({});
  const [actividadesReasignaciones, setActividadesReasignaciones] = useState({});
  const [mantenimientosReasignaciones, setMantenimientosReasignaciones] = useState({});

  // Fetch impact if deactivating a technician
  const loadImpact = async () => {
    setLoadingImpact(true);
    try {
      const data = await getBajaImpacto(usuario.id);
      setImpact(data);
      // Initialize mappings
      setTareasReasignaciones({});
      setActividadesReasignaciones({});
      setMantenimientosReasignaciones({});
    } catch (err) {
      toast.error("Error al cargar el impacto de la baja.");
      onClose();
    } finally {
      setLoadingImpact(false);
    }
  };

  useEffect(() => {
    if (isOpen && esActivo && esTecnico) {
      setStep(1);
      loadImpact();
    } else {
      setImpact(null);
      setStep(1);
    }
  }, [isOpen, usuario.id]);

  const handleConfirmar = async () => {
    if (!esActivo) {
      // Reactivation is always simple
      await onConfirm({ estado: "ACTIVO" });
      return;
    }

    if (!esTecnico) {
      // Non-technician deactivation is simple
      await onConfirm({ estado: "INACTIVO" });
      return;
    }

    // Technician deactivation with reassignments
    const payload = {
      estado: "INACTIVO",
      reasignaciones: {
        tareas: Object.entries(tareasReasignaciones).map(([tareaId, replacementId]) => ({
          tareaId: Number(tareaId),
          tecnicoReemplazoId: Number(replacementId),
        })),
        actividadesRecurrentes: Object.entries(actividadesReasignaciones).map(([reglaId, replacementId]) => ({
          reglaId: Number(reglaId),
          tecnicoReemplazoId: Number(replacementId),
        })),
        mantenimientosRecurrentes: Object.entries(mantenimientosReasignaciones).map(([reglaId, replacementId]) => ({
          reglaId: Number(reglaId),
          tecnicoReemplazoId: Number(replacementId),
        })),
      },
    };

    try {
      await onConfirm(payload);
    } catch (err) {
      if (err?.response?.status === 409) {
        // Reload impact if conflict
        toast.warn("El impacto ha cambiado. Recargando datos...");
        await loadImpact();
        setStep(1);
      }
    }
  };

  const handleAssignAllTareas = (techId) => {
    if (!impact) return;
    const next = {};
    impact.tareasActivas.forEach((t) => {
      next[t.id] = techId;
    });
    setTareasReasignaciones(next);
  };

  const handleAssignAllActividades = (techId) => {
    if (!impact) return;
    const next = {};
    impact.actividadesRecurrentes.forEach((a) => {
      next[a.id] = techId;
    });
    setActividadesReasignaciones(next);
  };

  const handleAssignAllMantenimientos = (techId) => {
    if (!impact) return;
    const next = {};
    impact.mantenimientosRecurrentes.forEach((m) => {
      next[m.id] = techId;
    });
    setMantenimientosReasignaciones(next);
  };

  const isStep1Valid = () => {
    if (!impact || impact.tareasActivas.length === 0) return true;
    return impact.tareasActivas.every((t) => !!tareasReasignaciones[t.id]);
  };

  const isStep2Valid = () => {
    if (!impact || impact.actividadesRecurrentes.length === 0) return true;
    return impact.actividadesRecurrentes.every((a) => !!actividadesReasignaciones[a.id]);
  };

  const isStep3Valid = () => {
    if (!impact || impact.mantenimientosRecurrentes.length === 0) return true;
    return impact.mantenimientosRecurrentes.every((m) => !!mantenimientosReasignaciones[m.id]);
  };

  const hasImpact = impact && (
    impact.tareasActivas.length > 0 ||
    impact.actividadesRecurrentes.length > 0 ||
    impact.mantenimientosRecurrentes.length > 0
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Simple Confirmation view (reactivation or non-technician or technician without impact)
  const showSimpleConfirm = !esActivo || !esTecnico || (impact !== null && !hasImpact);

  if (showSimpleConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} size="sm">
        <ModalHeader
          title={esActivo ? "Confirmar desactivación" : "Confirmar reactivación"}
          onClose={() => !isSubmitting && onClose()}
        />
        <ModalBody>
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
            <Icon
              name={esActivo ? "warning" : "check_circle"}
              size="64px"
              className={esActivo ? "text-estado-rechazado" : "text-estado-resuelto"}
            />
            <div className="text-slate-700">
              <p>¿Seguro que deseas <strong>{esActivo ? "DESACTIVAR" : "REACTIVAR"}</strong> al usuario?</p>
              <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 mt-3">
                <span className="block font-bold text-slate-900 text-lg">{usuario.nombre}</span>
                <span className="block text-sm text-slate-500 font-mono">{usuario.username}</span>
              </div>
              {esActivo && (
                <p className="text-xs text-estado-rechazado font-bold mt-4 bg-red-50 p-2 rounded-sm border border-red-100">
                  ⚠️ Perderá acceso inmediato al sistema.
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="cancelar" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant={esActivo ? "borrar" : "guardar"}
            size="md"
            onClick={handleConfirmar}
            isLoading={isSubmitting}
          >
            {esActivo ? "Sí, Desactivar" : "Sí, Reactivar"}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} size="lg">
      <ModalHeader
        title={`Baja de Técnico: ${usuario.nombre}`}
        onClose={() => !isSubmitting && onClose()}
      />
      <ModalBody>
        {loadingImpact || !impact ? (
          <div className="space-y-4 py-6">
            <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {/* Steps indicator */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider">
                <span className={`px-2 py-0.5 rounded-full ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>1. Tareas</span>
                <span className="text-slate-300">/</span>
                <span className={`px-2 py-0.5 rounded-full ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>2. Actividades</span>
                <span className="text-slate-300">/</span>
                <span className={`px-2 py-0.5 rounded-full ${step === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>3. Preventivos</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Paso {step} de 3</span>
            </div>

            {/* STEP 1: Tareas Activas */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
                  <strong>Tareas Activas Asignadas:</strong> El técnico saliente es responsable de las siguientes tareas abiertas. Selecciona un reemplazo para cada una.
                </div>

                {impact?.tareasActivas.length > 0 ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">Reasignación Rápida (Todos):</span>
                      <div className="w-full md:w-64">
                        <Select onChange={(e) => handleAssignAllTareas(e.target.value)} value="">
                          <option value="">Elegir técnico para todos...</option>
                          {impact.tecnicosDisponibles.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 border rounded-md p-2">
                      {impact.tareasActivas.map((tarea) => (
                        <div key={tarea.id} className="p-3 bg-white border rounded-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-800 block">{tarea.titulo}</span>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold">{tarea.estado}</span>
                              <span>Vence: {formatDate(tarea.fechaVencimiento || tarea.fechaProgramadaPreventiva)}</span>
                            </div>
                          </div>
                          <div className="w-full md:w-56 shrink-0">
                            <Select
                              value={tareasReasignaciones[tarea.id] || ""}
                              onChange={(e) => setTareasReasignaciones({ ...tareasReasignaciones, [tarea.id]: e.target.value })}
                            >
                              <option value="">Elegir reemplazo...</option>
                              {impact.tecnicosDisponibles.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 font-medium">
                    Sin elementos afectados en este paso.
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Actividades Recurrentes */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
                  <strong>Actividades Recurrentes:</strong> El técnico saliente es miembro responsable en los siguientes ciclos de actividades. Se conectará al técnico de reemplazo en su lugar.
                </div>

                {impact?.actividadesRecurrentes.length > 0 ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">Reasignación Rápida (Todos):</span>
                      <div className="w-full md:w-64">
                        <Select onChange={(e) => handleAssignAllActividades(e.target.value)} value="">
                          <option value="">Elegir técnico para todos...</option>
                          {impact.tecnicosDisponibles.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 border rounded-md p-2">
                      {impact.actividadesRecurrentes.map((regla) => (
                        <div key={regla.id} className="p-3 bg-white border rounded-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-800 block">{regla.titulo}</span>
                            <span className="text-xs text-slate-500 block">{regla.planta} — {regla.area} ({regla.categoria})</span>
                          </div>
                          <div className="w-full md:w-56 shrink-0">
                            <Select
                              value={actividadesReasignaciones[regla.id] || ""}
                              onChange={(e) => setActividadesReasignaciones({ ...actividadesReasignaciones, [regla.id]: e.target.value })}
                            >
                              <option value="">Elegir reemplazo...</option>
                              {impact.tecnicosDisponibles.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 font-medium">
                    Sin elementos afectados en este paso.
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Mantenimientos Preventivos Recurrentes */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm">
                  <strong>Mantenimientos Preventivos Recurrentes:</strong> El técnico es el responsable principal de las siguientes reglas preventivas de maquinaria.
                </div>

                {impact?.mantenimientosRecurrentes.length > 0 ? (
                  <>
                    <div className="bg-slate-50 p-3 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-700">Reasignación Rápida (Todos):</span>
                      <div className="w-full md:w-64">
                        <Select onChange={(e) => handleAssignAllMantenimientos(e.target.value)} value="">
                          <option value="">Elegir técnico para todos...</option>
                          {impact.tecnicosDisponibles.map((t) => (
                            <option key={t.id} value={t.id}>{t.nombre}</option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 border rounded-md p-2">
                      {impact.mantenimientosRecurrentes.map((regla) => (
                        <div key={regla.id} className="p-3 bg-white border rounded-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-sm font-bold text-slate-800 block">{regla.titulo}</span>
                            <span className="text-xs text-slate-500 block">Máquina: {regla.maquina?.nombre} [{regla.maquina?.codigo}] — {regla.frecuencia}</span>
                          </div>
                          <div className="w-full md:w-56 shrink-0">
                            <Select
                              value={mantenimientosReasignaciones[regla.id] || ""}
                              onChange={(e) => setMantenimientosReasignaciones({ ...mantenimientosReasignaciones, [regla.id]: e.target.value })}
                            >
                              <option value="">Elegir reemplazo...</option>
                              {impact.tecnicosDisponibles.map((t) => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 font-medium">
                    Sin elementos afectados en este paso.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="flex justify-between items-center w-full">
          <div>
            {step > 1 && (
              <Button variant="secundario" size="md" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                Atrás
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="cancelar" size="md" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            {step < 3 ? (
              <Button
                variant="guardar"
                size="md"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid() : !isStep2Valid()}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="borrar"
                size="md"
                onClick={handleConfirmar}
                isLoading={isSubmitting}
                disabled={!isStep3Valid()}
              >
                Reasignar y dar de baja
              </Button>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};