import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Icon, Button, Spinner } from '@/components/ui/z_index';
import { formatFecha } from '@/lib/date';
import api from '@/lib/axios';

const limpiarNota = (nota) => {
  if (!nota) return '';
  return nota
    .replace(/\s*\[TIEMPO_MANUAL:[^\]]+\]/gi, '')
    .replace(/\s*\|\|\[META:TIEMPO_MANUAL\]\|\|/gi, '')
    .trim();
};

const obtenerTiempoManual = (nota) => {
  if (!nota) return null;
  const match = nota.match(/\[TIEMPO_MANUAL:([^\]]+)\]/i);
  return match ? match[1] : null;
};

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
  const [limit, setLimit] = useState(3);
  const [totalTickets, setTotalTickets] = useState(0);
  const [expandedTickets, setExpandedTickets] = useState({});
  const [isQrOpen, setIsQrOpen] = useState(false);

  const qrUrl = maquina
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `${window.location.origin}/hoy/todas?prefill=${maquina.codigo}`
      )}`
    : '';

  const descargarQR = async () => {
    if (!maquina || !qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${maquina.codigo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el QR:', error);
      if (qrUrl) window.open(qrUrl, '_blank');
    }
  };

  const imprimirQR = () => {
    if (!maquina || !qrUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${maquina.codigo}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 40px;
            }
            .card {
              border: 3px double #333;
              padding: 30px;
              border-radius: 12px;
              max-width: 350px;
            }
            .code {
              font-size: 24px;
              font-weight: bold;
              font-family: monospace;
              margin: 10px 0;
              letter-spacing: 2px;
            }
            .name {
              font-size: 18px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 20px;
              color: #222;
            }
            .qr {
              margin: 15px 0;
            }
            .desc {
              font-size: 11px;
              color: #666;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="code">${maquina.codigo}</div>
            <div class="name">${maquina.nombre}</div>
            <div class="qr">
              <img src="${qrUrl}" width="200" height="200" alt="QR Code" />
            </div>
            <div class="desc">
              Escanee para reportar falla o solicitar servicio técnico.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const toggleExpand = (id) => {
    setExpandedTickets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    if (isOpen && maquina) {
      setLoading(true);
      Promise.all([
        getKpis(maquina.id),
        api.get('/api/tickets', { params: { maquinaId: maquina.id, limit } })
      ]).then(([kpisData, ticketsRes]) => {
        setKpis(kpisData);
        setTickets(ticketsRes?.data || []);
        setTotalTickets(ticketsRes?.pagination?.total || ticketsRes?.data?.length || 0);
      }).catch(err => {
        console.error('Error al cargar datos del detalle de máquina:', err);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setKpis(null);
      setTickets([]);
      setTotalTickets(0);
      setLimit(3);
      setExpandedTickets({});
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

  const formatMTBF = (days) => {
    if (days === null || days === undefined) return 'Sin datos';
    return `Cada ${days} ${days === 1 ? 'día' : 'días'}`;
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

  // ─── BADGE: Clasificación — fondo neutro, punto de color semántico ───────────
  const getClasificacionBadge = (clasif) => {
    if (!clasif) return null;
    const dotColor = {
      CORRECTIVO: 'bg-rose-400',
      PREVENTIVO: 'bg-emerald-400',
      AUTONOMO: 'bg-blue-400'
    }[clasif] || 'bg-slate-400';

    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200 bg-slate-50 text-slate-500 leading-none">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        {clasif}
      </span>
    );
  };

  // ─── BADGE: Tipo — completamente neutro, el ícono diferencia ─────────────────
  const getTipoBadge = (tipo) => {
    const map = {
      TICKET:        { label: 'Reporte Cliente', icon: 'person' },
      PLANEADA:      { label: 'Planeado',        icon: 'calendar_today' },
      EXTRAORDINARIA:{ label: 'Extraordinario',  icon: 'bolt' }
    };
    const item = map[tipo] || { label: tipo, icon: 'assignment' };
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-200 bg-slate-100 text-slate-500 leading-none">
        <Icon name={item.icon} size="10px" className="shrink-0" />
        {item.label}
      </span>
    );
  };

  // ─── BADGE: Estado máquina — se usa solo una vez en el header ────────────────
  const getEstadoBadge = (est) => {
    const map = {
      OPERATIVA:    { label: 'Operativa',     cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      PARO_PRODUCCION: { label: 'Paro Producción', cls: 'text-red-700 bg-red-50 border-red-200' },
      EN_REPARACION:{ label: 'En Reparación', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
      INACTIVA:     { label: 'Inactiva',      cls: 'text-slate-700 bg-slate-50 border-slate-200' },
      BAJA:         { label: 'Baja',          cls: 'text-red-700 bg-red-50 border-red-200' }
    };
    const c = map[est] || { label: est, cls: 'text-slate-700 bg-slate-50 border-slate-200' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${c.cls}`}>
        {c.label}
      </span>
    );
  };

  // ─── BADGE: Estado ticket — solo PENDIENTE/RESUELTO llevan color ─────────────
  const getTicketEstadoStyle = (state) => {
    const map = {
      PENDIENTE:   'text-amber-700 bg-amber-50 border-amber-200',
      RESUELTO:    'text-emerald-700 bg-emerald-50 border-emerald-200',
      CERRADO:     'text-slate-700 bg-slate-100 border-slate-300',
      RECHAZADO:   'text-slate-500 bg-slate-50 border-slate-200',
      CANCELADA:   'text-slate-400 bg-slate-50 border-slate-100'
    };
    return map[state] || 'text-slate-600 bg-slate-50 border-slate-200';
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="w-full md:max-w-4xl lg:max-w-5xl">
        <ModalHeader onClose={onClose}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3 w-full pr-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-marca-primario/10 rounded-lg text-marca-primario shrink-0">
                <Icon name="precision_manufacturing" size="sm" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black font-mono text-marca-primario">{maquina.codigo}</span>
                <span className="text-base font-black uppercase text-slate-800 tracking-tight leading-tight mt-0.5 break-words">
                  {maquina.nombre}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {getEstadoBadge(maquina.estado)}
              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all shadow-sm cursor-pointer leading-none"
              >
                <Icon name="qr_code" size="14px" className="shrink-0" />
                Ver QR
              </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                    <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl shrink-0 flex items-center justify-center">
                      <Icon name="report_problem" size="sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Fallas Reportadas</span>
                      <span className="text-lg font-black text-slate-800 leading-snug">{kpis?.resumen?.totalFallas ?? 0}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total acumulado</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                    <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl shrink-0 flex items-center justify-center">
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

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                    <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl shrink-0 flex items-center justify-center">
                      <Icon name="hourglass_empty" size="sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Tiempo en Reparación</span>
                      <span className="text-sm font-black text-slate-800 leading-snug break-words">
                        {formatMTTR(kpis?.resumen?.minutosReparacionAcumulados)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total acumulado</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                    <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl shrink-0 flex items-center justify-center">
                      <Icon name="update" size="sm" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Frecuencia de Solicitud</span>
                      <span className="text-sm font-black text-slate-800 leading-snug break-words">
                        {formatMTBF(kpis?.resumen?.mtbfDias)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">MTBF Promedio</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 transition-all hover:shadow-md">
                    <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl shrink-0 flex items-center justify-center">
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
                      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scrollbar">
                        {tickets.map((t) => {
                          const isExpanded = !!expandedTickets[t.id];
                          // Buscar el evento de resolución del técnico primero (para ver sus observaciones reales de reparación)
                          let eventoResolucion = t.historial?.find(
                            (h) => h.estadoNuevo === 'RESUELTO'
                          );
                          // Si no hay evento de RESUELTO, buscar el de CERRADO (ej. inspecciones o rutinas directas)
                          if (!eventoResolucion) {
                            eventoResolucion = t.historial?.find(
                              (h) => h.estadoNuevo === 'CERRADO'
                            );
                          }

                          const tiempoManual = eventoResolucion ? obtenerTiempoManual(eventoResolucion.nota) : null;
                          const notaLimpia = eventoResolucion ? limpiarNota(eventoResolucion.nota) : '';

                          return (
                            <div key={t.id} className="flex flex-col hover:bg-slate-50/30 transition-colors">
                              {/* Cabecera del Item */}
                              <div 
                                onClick={() => toggleExpand(t.id)}
                                className="p-3.5 flex items-center justify-between gap-4 text-xs cursor-pointer select-none"
                              >
                                <div className="flex flex-col min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-mono text-[9px] font-extrabold text-slate-400">#{t.id}</span>
                                    {getTipoBadge(t.tipo)}
                                    {getClasificacionBadge(t.clasificacion)}
                                    <span className="text-[10px] font-medium text-slate-400">
                                      {t.finalizadoAt ? `Finalizado: ${formatFecha(t.finalizadoAt)}` : `Creado: ${formatFecha(t.createdAt)}`}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-slate-700 mt-1.5 leading-snug">{t.titulo}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] font-black uppercase border px-2.5 py-1 rounded tracking-wide ${getTicketEstadoStyle(t.estado)}`}>
                                    {t.estado}
                                  </span>
                                  <Icon 
                                    name={isExpanded ? 'expand_less' : 'expand_more'} 
                                    className="text-slate-400 transition-transform duration-200" 
                                    size="sm" 
                                  />
                                </div>
                              </div>

                              {/* Contenido Desplegable */}
                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/20 text-xs text-slate-600 animate-in slide-in-from-top-2 duration-150 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Izquierda */}
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Solicitado por:</span>
                                        <span className="font-medium text-slate-700">
                                          {t.tipo === 'TICKET' 
                                            ? `Cliente: ${t.creador?.nombre || 'Desconocido'} (${t.creador?.departamento?.nombre || 'Sin departamento'})`
                                            : `Equipo Técnico: ${t.creador?.nombre || 'Desconocido'} (${t.creador?.cargo || 'Mantenimiento'})`}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Técnicos Responsables:</span>
                                        <span className="font-medium text-slate-700">
                                          {t.responsables && t.responsables.length > 0
                                            ? t.responsables.map(r => `${r.nombre} (${r.cargo || 'Técnico'})`).join(', ')
                                            : 'Sin técnicos asignados.'}
                                        </span>
                                      </div>
                                      {t.descripcion && t.descripcion !== 'Sin descripción.' && (
                                        <div>
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Detalles del problema:</span>
                                          <p className="mt-0.5 text-slate-600 bg-white p-2 border border-slate-200/50 rounded-lg whitespace-pre-wrap leading-relaxed">
                                            {t.descripcion}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Derecha */}
                                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/60 md:pl-4">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Observaciones de Reparación:</span>
                                      {eventoResolucion ? (
                                        <div className="space-y-1.5">
                                          <div className="flex items-center gap-1.5">
                                            <Icon name="check_circle" className="text-emerald-500" size="14px" />
                                            <span className="font-bold text-slate-700">Resuelto por {eventoResolucion.usuario?.nombre}</span>
                                          </div>
                                          <div className="bg-white p-2.5 border border-slate-200/50 rounded-lg flex flex-col gap-1.5">
                                            <p className="font-medium text-slate-700 leading-relaxed">
                                              {notaLimpia || 'Sin observaciones de cierre.'}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {tiempoManual && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                                  <Icon name="timer" size="12px" />
                                                  Tiempo registrado: {tiempoManual}
                                                </span>
                                              )}
                                              {eventoResolucion.esTiempoManual && !tiempoManual && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                                  <Icon name="timer" size="12px" />
                                                  Tiempo registrado manualmente
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[9px] text-slate-400 mt-1 font-bold flex items-center justify-between border-t border-slate-100 pt-1.5">
                                              <span>Fecha de reparación:</span>
                                              <span>{formatFecha(eventoResolucion.createdAt)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="p-3 bg-white border border-slate-200/50 rounded-lg text-slate-400 italic flex items-center gap-1.5">
                                          <Icon name="hourglass_empty" size="14px" />
                                          {t.estado === 'CANCELADA' 
                                            ? 'El mantenimiento fue cancelado sin registrar solución.' 
                                            : 'Esta tarea aún se encuentra activa o en proceso de reparación.'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {totalTickets > tickets.length && (
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setLimit(500)}
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

        <ModalBody className="p-0 max-h-0 min-h-0 overflow-hidden" />

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

      {isQrOpen && (
        <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} className="w-full max-w-sm">
          <ModalHeader onClose={() => setIsQrOpen(false)}>
            <div className="flex items-center gap-2">
              <Icon name="qr_code" className="text-marca-primario animate-pulse" />
              <span className="font-bold text-slate-800">Código QR del Equipo</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-6 flex flex-col items-center text-center gap-5">
            <div className="flex flex-col items-center">
              <span className="text-xs font-black font-mono text-marca-primario">{maquina.codigo}</span>
              <span className="text-sm font-black uppercase text-slate-800 tracking-tight leading-snug">
                {maquina.nombre}
              </span>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center shadow-inner relative group">
              <img 
                src={qrUrl} 
                width="180" 
                height="180" 
                alt={`QR ${maquina.codigo}`} 
                className="mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            
            <div className="space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl w-full">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">URL del QR</span>
              <span className="text-[10px] font-mono text-slate-500 break-all select-all font-medium">
                {window.location.origin}/hoy/todas?prefill={maquina.codigo}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400 font-medium max-w-[250px]">
              Escanea el código para reportar una falla o registrar mantenimiento programado de manera inmediata en la aplicación.
            </p>
          </ModalBody>
          <ModalFooter className="flex gap-2 justify-end w-full">
            <Button
              variant="light"
              size="sm"
              icon="print"
              onClick={imprimirQR}
            >
              Imprimir
            </Button>
            <Button
              variant="primario"
              size="sm"
              icon="download"
              onClick={descargarQR}
            >
              Descargar
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};
