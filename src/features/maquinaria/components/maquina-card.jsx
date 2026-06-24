import React from 'react';
import { Icon, Tooltip } from '@/components/ui/z_index';

export const MaquinaCard = ({
  maquina,
  onViewDetail,
  onEdit
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
      EN_REPARACION: 'bg-amber-50 text-amber-700 border-amber-200',
      INACTIVA: 'bg-slate-50 text-slate-700 border-slate-200',
      BAJA: 'bg-rose-50 text-rose-700 border-rose-200',
      BAJA_ERP: 'bg-red-50 text-red-700 border-red-200'
    };
    return map[est] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const label = maquina.estado === 'EN_REPARACION' ? 'REPARACIÓN' : (maquina.estado === 'BAJA_ERP' ? 'BAJA ERP' : maquina.estado);

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

      {/* Renglón Inferior: Ubicación */}
      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-500">
        {(() => {
          const showPlanta = maquina.planta !== 'BAJA' && maquina.planta !== 'VENTA';
          const showArea = maquina.area !== 'BAJA' && maquina.area !== 'VENTA';
          if (!showPlanta && !showArea) {
            return <span className="text-slate-400 font-semibold italic text-xs">-</span>;
          }
          return (
            <span className="flex items-center gap-1">
              <Icon name="location_on" size="xxs" className="text-slate-400" />
              {showPlanta && showArea ? `${maquina.planta} — ${maquina.area}` : (showPlanta ? maquina.planta : maquina.area)}
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
