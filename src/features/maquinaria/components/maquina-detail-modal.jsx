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
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
      <span className={`text-xs font-bold text-slate-700 wrap-break-word ${colorClass}`}>
        {value || <span className="text-slate-300 italic font-normal">{fallback}</span>}
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

  useEffect(() => {
    if (isOpen && maquina) {
      setLoading(true);
      Promise.all([
        getKpis(maquina.id),
        api.get('/api/tickets', { params: { maquinaId: maquina.id, limit: 10 } })
      ]).then(([kpisData, ticketsRes]) => {
        setKpis(kpisData);
        setTickets(ticketsRes?.data?.data || []);
      }).catch(err => {
        console.error('Error al cargar datos del detalle de máquina:', err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setKpis(null);
      setTickets([]);
    }
  }, [isOpen, maquina, getKpis]);

  if (!maquina) return null;

  const formatMTTR = (min) => {
    if (min === null || min === undefined) return 'Sin datos';
    if (min < 60) return `${min} minutos`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatMTBF = (days) => {
    if (days === null || days === undefined) return 'Sin datos';
    return `${days} ${days === 1 ? 'día' : 'días'}`;
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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center justify-between w-full pr-6">
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

      <ModalBody className="p-6 max-h-[70dvh] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="md" className="text-marca-primario" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando expediente técnico...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Ficha Técnica (Izquierda) */}
            <div className="lg:col-span-5 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                Ficha Técnica
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <DataRow icon="build" label="Tipo / Proceso" value={maquina.proceso} />
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5 text-slate-400 shrink-0">
                    <Icon name="priority_high" size="sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Criticidad</span>
                    <span className={`text-xs font-bold leading-none self-start mt-0.5 ${getCriticidadStyle(maquina.criticidad)}`}>
                      {getCriticidadLabel(maquina.criticidad)}
                    </span>
                  </div>
                </div>
                <DataRow icon="store" label="Planta" value={maquina.planta} />
                <DataRow icon="location_on" label="Área / Ubicación" value={maquina.area} />
                <DataRow icon="map" label="Ubicación Específica" value={maquina.ubicacionDetalle} />
                <DataRow icon="badge" label="Marca" value={maquina.marca} />
                <DataRow icon="bookmark" label="Modelo" value={maquina.modelo} />
                <DataRow icon="qr_code" label="Número de Serie" value={maquina.numeroSerie} />
                <DataRow icon="corporate_fare" label="Departamento Asignado" value={maquina.departamento?.nombre} />
                <DataRow icon="calendar_today" label="Fecha de Instalación" value={maquina.fechaInstalacion ? formatFecha(maquina.fechaInstalacion) : null} />
                {maquina.descripcion && (
                  <div className="col-span-full border-t border-slate-200 pt-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1.5">Notas adicionales</span>
                    <p className="text-xs font-medium text-slate-600 bg-white p-3 border border-slate-200/50 rounded-xl max-h-32 overflow-y-auto custom-scrollbar">
                      {maquina.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* KPIs e Historial (Derecha) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* KPIs de Fiabilidad */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Indicadores de Fiabilidad
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                  
                  {/* Frecuencia Fallas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fallas totales</span>
                    <span className="text-2xl font-black text-slate-800 mt-2">{kpis?.resumen?.totalFallas ?? 0}</span>
                  </div>

                  {/* MTTR */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MTTR (Reparación)</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-2 truncate">
                      {formatMTTR(kpis?.resumen?.mttrMinutos)}
                    </span>
                  </div>

                  {/* MTBF */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MTBF (Fallas)</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-2 truncate">
                      {formatMTBF(kpis?.resumen?.mtbfDias)}
                    </span>
                  </div>

                  {/* Tiempo Acumulado */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">T. Reparación</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-2 truncate">
                      {formatMTTR(kpis?.resumen?.minutosReparacionAcumulados)}
                    </span>
                  </div>

                </div>
              </div>

              {/* Historial de Fallas */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  Últimos Reportes de Falla ({tickets.length})
                </h4>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {tickets.length > 0 ? (
                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
                      {tickets.map((t) => (
                        <div key={t.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono text-[10px] font-bold text-slate-400">#{t.id} — {formatFecha(t.createdAt)}</span>
                            <span className="font-semibold text-slate-700 truncate mt-0.5">{t.titulo}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase border px-2 py-0.5 rounded tracking-wide shrink-0 ${getTicketEstadoStyle(t.estado)}`}>
                            {t.estado}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic">
                      <Icon name="check_circle_outline" className="text-emerald-500 mb-1 mx-auto" size="md" />
                      No se registran fallas para esta máquina.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}
      </ModalBody>

      <ModalFooter className="p-4 bg-slate-50 flex justify-end rounded-b-2xl border-t border-slate-100">
        <Button
          type="button"
          onClick={onClose}
          className="bg-marca-primario hover:bg-marca-primario-oscuro text-white font-bold text-xs uppercase"
        >
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
