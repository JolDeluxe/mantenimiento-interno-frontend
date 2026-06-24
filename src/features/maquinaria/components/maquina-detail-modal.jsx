import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button, Spinner } from '@/components/ui/z_index';
import { formatFecha } from '@/lib/date';
import api from '@/lib/axios';

const DataRow = ({ icon, label, value, fallback = 'No registrado', colorClass = '' }) => (
  <div className="flex gap-2.5 items-start">
    <div className="mt-0.5 text-slate-400 shrink-0">
      <Icon name={icon} size="sm" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 wrap-break-word ${colorClass}`}>
        {value || <span className="text-slate-400 italic font-normal">{fallback}</span>}
      </span>
    </div>
  </div>
);

export const MaquinaDetailModal = ({
  isOpen,
  onClose,
  maquina = null,
  getKpis
}) => {
  const [kpis, setKpis] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    if (isOpen && maquina) {
      setLoading(true);
      Promise.all([
        getKpis(maquina.id),
        api.get('/api/tickets', { params: { maquinaId: maquina.id, limit } })
      ]).then(([kpisData, ticketsRes]) => {
        setKpis(kpisData);
        setTickets(ticketsRes?.data?.data || []);
        setTotalTickets(ticketsRes?.data?.pagination?.total || ticketsRes?.data?.data?.length || 0);
      }).catch(err => {
        console.error('Error al cargar datos del detalle de máquina:', err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setKpis(null);
      setTickets([]);
      setTotalTickets(0);
      setLimit(10);
    }
  }, [isOpen, maquina, getKpis, limit]);

  if (!maquina) return null;

  const formatMTTR = (min) => {
    if (min === null || min === undefined) return 'Sin datos';
    if (min < 60) return `${min} minutos`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const getCriticidadLabel = (crit) => {
    const map = { A: 'A (Crítica)', B: 'B (Media)', C: 'C (Baja)' };
    return map[crit] || crit;
  };

  const getCriticidadStyle = (crit) => {
    const map = {
      A: 'text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded',
      B: 'text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded',
      C: 'text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded'
    };
    return map[crit] || 'text-slate-700';
  };

  const getEstadoBadge = (est) => {
    const map = {
      OPERATIVA: { label: 'Operativa', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      EN_REPARACION: { label: 'En Reparación', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
      INACTIVA: { label: 'Inactiva', cls: 'text-slate-700 bg-slate-50 border-slate-200' },
      BAJA: { label: 'Baja', cls: 'text-red-700 bg-red-50 border-red-200' }
    };
    const c = map[est] || { label: est, cls: 'text-slate-700 bg-slate-50 border-slate-200' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${c.cls}`}>
        {c.label}
      </span>
    );
  };

  const getTicketEstadoStyle = (state) => {
    const map = {
      PENDIENTE: 'text-yellow-700 bg-yellow-50',
      ASIGNADA: 'text-blue-700 bg-blue-50',
      EN_PROGRESO: 'text-purple-700 bg-purple-50',
      EN_PAUSA: 'text-slate-700 bg-slate-100',
      RESUELTO: 'text-green-700 bg-green-50',
      CERRADO: 'text-emerald-700 bg-emerald-100',
      RECHAZADO: 'text-red-700 bg-red-50',
      CANCELADA: 'text-slate-400 bg-slate-50'
    };
    return map[state] || 'text-slate-600 bg-slate-50';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full md:max-w-4xl lg:max-w-5xl">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center justify-between w-full pr-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario">
              <Icon name="precision_manufacturing" size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black font-mono text-marca-primario">{maquina.codigo}</span>
              <span className="text-base font-black uppercase text-slate-800 tracking-tight leading-none mt-0.5">
                {maquina.nombre}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {getEstadoBadge(maquina.estado)}
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="md" className="text-marca-primario" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando expediente técnico...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Sección 1: Indicadores */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Icon name="analytics" size="sm" className="text-slate-500" />
                Indicadores de Fiabilidad
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Fallas Reportadas */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0 flex items-center justify-center">
                    <Icon name="report_problem" size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Fallas Reportadas</span>
                    <span className="text-lg font-black text-slate-800 leading-snug">{kpis?.resumen?.totalFallas ?? 0}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total acumulado</span>
                  </div>
                </div>

                {/* Promedio Solución */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                  <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl shrink-0 flex items-center justify-center">
                    <Icon name="build_circle" size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Promedio de Solución</span>
                    <span className="text-sm font-black text-slate-800 leading-snug break-words">
                      {formatMTTR(kpis?.resumen?.mttrMinutos)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Por reporte</span>
                  </div>
                </div>

                {/* Tiempo en Reparación */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                  <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl shrink-0 flex items-center justify-center">
                    <Icon name="hourglass_empty" size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tiempo en Reparación</span>
                    <span className="text-sm font-black text-slate-800 leading-snug break-words">
                      {formatMTTR(kpis?.resumen?.minutosReparacionAcumulados)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total de horas</span>
                  </div>
                </div>

                {/* Último Mantenimiento */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shrink-0 flex items-center justify-center">
                    <Icon name="calendar_today" size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Último Mantenimiento</span>
                    <span className="text-sm font-black text-slate-800 leading-snug break-words">
                      {kpis?.resumen?.fechaUltimoServicio ? formatFecha(kpis?.resumen?.fechaUltimoServicio) : 'Sin datos'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Fecha de servicio</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Sección 2: Ficha Técnica */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Icon name="description" size="sm" className="text-slate-500" />
                Ficha Técnica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Tarjeta 1: Especificaciones */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3 flex flex-col">
                  <h5 className="text-[11px] font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icon name="settings" size="xs" className="text-slate-500" />
                    Especificaciones
                  </h5>
                  <div className="space-y-3 grow">
                    <DataRow icon="build" label="Tipo / Proceso" value={maquina.proceso} />
                    
                    <div className="flex gap-2.5 items-start">
                      <div className="mt-0.5 text-slate-400 shrink-0">
                        <Icon name="priority_high" size="sm" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Criticidad</span>
                        <span className={`text-xs font-bold leading-none self-start mt-0.5 ${getCriticidadStyle(maquina.criticidad)}`}>
                          {getCriticidadLabel(maquina.criticidad)}
                        </span>
                      </div>
                    </div>

                    {maquina.marca && <DataRow icon="badge" label="Marca" value={maquina.marca} />}
                    {maquina.modelo && <DataRow icon="bookmark" label="Modelo" value={maquina.modelo} />}
                    {maquina.numeroSerie && <DataRow icon="qr_code" label="Número de Serie" value={maquina.numeroSerie} />}
                  </div>
                </div>

                {/* Tarjeta 2: Ubicación y Área */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3 flex flex-col">
                  <h5 className="text-[11px] font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icon name="location_on" size="xs" className="text-slate-500" />
                    Ubicación y Área
                  </h5>
                  <div className="space-y-3 grow">
                    {(() => {
                      const showPlanta = maquina.planta !== 'BAJA' && maquina.planta !== 'VENTA';
                      const showArea = maquina.area !== 'BAJA' && maquina.area !== 'VENTA';
                      if (!showPlanta && !showArea) {
                        return <DataRow icon="store" label="Planta y Área" value="-" />;
                      }
                      return (
                        <>
                          {showPlanta && <DataRow icon="store" label="Planta" value={maquina.planta} />}
                          {showArea && <DataRow icon="place" label="Área / Ubicación" value={maquina.area} />}
                        </>
                      );
                    })()}

                    {maquina.ubicacionDetalle && 
                     maquina.ubicacionDetalle !== 'BAJA' && 
                     maquina.ubicacionDetalle !== 'VENTA' && 
                     maquina.ubicacionDetalle !== maquina.area && (
                      <DataRow icon="map" label="Ubicación Específica" value={maquina.ubicacionDetalle} />
                    )}

                    {maquina.departamento?.nombre && (
                      <DataRow icon="corporate_fare" label="Departamento Asignado" value={maquina.departamento.nombre} />
                    )}
                  </div>
                </div>

                {/* Tarjeta 3: Notas Adicionales */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 space-y-3 flex flex-col">
                  <h5 className="text-[11px] font-black text-slate-900 border-b border-slate-200/85 pb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <Icon name="event_note" size="xs" className="text-slate-500" />
                    Notas Adicionales
                  </h5>
                  <div className="grow flex flex-col">
                    {maquina.descripcion ? (
                      <p className="text-xs font-medium text-slate-600 bg-white p-3 border border-slate-200/50 rounded-xl h-full max-h-36 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                        {maquina.descripcion}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-normal py-4 block text-center my-auto">
                        Sin notas u observaciones registradas.
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Sección 3: Historial de Mantenimiento */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Icon name="history" size="sm" className="text-slate-500" />
                Historial de Mantenimiento ({totalTickets})
              </h4>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {tickets.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
                      {tickets.map((t) => (
                        <div key={t.id} className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{t.id}</span>
                              <span className="text-[10px] font-bold text-slate-400">{formatFecha(t.createdAt)}</span>
                            </div>
                            <span className="font-bold text-slate-700 mt-1.5 leading-snug">{t.titulo}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase border px-2.5 py-1 rounded tracking-wide shrink-0 ${getTicketEstadoStyle(t.estado)}`}>
                            {t.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                    {totalTickets > tickets.length && (
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setLimit(1000)}
                          className="text-xs font-bold text-marca-primario hover:text-marca-primario/80 transition-colors flex items-center justify-center gap-1 cursor-pointer w-full py-1.5 rounded-lg hover:bg-slate-100"
                        >
                          <Icon name="expand_more" size="xs" />
                          Ver todos ({totalTickets})
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center text-slate-400 italic gap-2.5">
                    <Icon name="construction" className="text-emerald-500" size="md" />
                    <span className="max-w-md text-xs leading-normal">
                      No se han registrado mantenimientos asociados a esta máquina.
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="cancelar"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
