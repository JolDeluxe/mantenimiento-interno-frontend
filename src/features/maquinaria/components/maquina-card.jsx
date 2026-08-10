import React from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';
import { formatDays, formatInteger, formatMinutes, formatPercent } from '../utils/bi-maquinaria-format';

export const MaquinaCard = ({
  maquina,
  onViewDetail,
  onEdit,
  biSummary,
  biSummaryLoading = false
}) => {
  const getCriticidadStyle = (crit) => {
    const map = {
      A: 'bg-rose-50 text-rose-700 border-rose-200',
      B: 'bg-amber-50 text-amber-700 border-amber-200',
      C: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return map[crit] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getEstadoStyle = (est) => {
    const map = {
      OPERATIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PARO_PRODUCCION: 'bg-red-50 text-red-700 border-red-200',
      EN_REPARACION: 'bg-amber-50 text-amber-700 border-amber-200',
      INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
      BAJA: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[est] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const label = maquina.estado === 'EN_REPARACION'
    ? 'REPARACIÓN'
    : maquina.estado === 'PARO_PRODUCCION'
      ? 'PARO PRODUCCIÓN'
      : (maquina.estado === 'BAJA' ? 'BAJA ERP' : maquina.estado);

  return (
    <div
      onClick={() => onViewDetail(maquina)}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:bg-slate-50/50 transition-colors flex flex-col gap-3 relative cursor-pointer"
    >
      {/* Renglón Superior: Código y Badges */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-black text-[11px] text-slate-400 uppercase tracking-wider">
          {maquina.codigo}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded tracking-wide ${getCriticidadStyle(maquina.criticidad)}`}>
            Clase {maquina.criticidad}
          </span>
          <span className={`text-[9px] font-black uppercase border px-2 py-0.5 rounded tracking-wide ${getEstadoStyle(maquina.estado)}`}>
            {label}
          </span>
        </div>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-0.5 pr-20">
        <span className="font-extrabold text-slate-800 text-sm leading-tight uppercase">
          {maquina.nombre}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          {maquina.proceso}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
        {biSummaryLoading ? (
          <>
            <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
          </>
        ) : biSummary ? (
          <>
            <span className="rounded-lg bg-slate-50 px-2 py-1">Fallas <strong className="text-slate-900">{formatInteger(biSummary.metricas?.frecuencia?.valor)}</strong></span>
            <span className="rounded-lg bg-slate-50 px-2 py-1">Disp. <strong className="text-slate-900">{formatPercent(biSummary.metricas?.disponibilidad?.valorPorcentaje)}</strong></span>
            <span className="rounded-lg bg-slate-50 px-2 py-1">MTTR técnico <strong className="text-slate-900">{formatMinutes(biSummary.metricas?.mttr?.valorMinutos)}</strong></span>
            <span className="rounded-lg bg-slate-50 px-2 py-1">MTBF <strong className="text-slate-900">{formatDays(biSummary.metricas?.mtbf?.valorDias)}</strong></span>
          </>
        ) : (
          <span className="col-span-2 rounded-lg bg-slate-50 px-2 py-1 text-slate-400">Indicadores no disponibles</span>
        )}
      </div>

      {/* Renglón Inferior: Ubicación */}
      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
        {(() => {
          const showArea = typeof maquina.area === 'string' ? maquina.area.trim() : maquina.area;
          if (!showArea) {
            return <span />;
          }
          return (
            <span className="flex items-center gap-1">
              <Icon name="location_on" size="xxs" className="text-slate-400" />
              {maquina.area}
            </span>
          );
        })()}

        {/* Menú de Acciones Rápidas */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Tooltip text="Editar Criticidad" variant="dark">
            <button
              onClick={() => onEdit(maquina)}
              className="p-1 text-amber-500 hover:bg-amber-500/10 rounded-lg cursor-pointer border-0 bg-transparent transition-colors active:scale-95"
            >
              <Icon name="edit" size="sm" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
