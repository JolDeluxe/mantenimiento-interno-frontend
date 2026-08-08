import { cn } from '@/utils/cn';
import { DurationValue } from './duration-value';
import { formatPercent, getRowTitle } from '../utils/dias-laborados-format';

const Line = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-0.5 text-xs">
    <span className="text-slate-500">{label}</span>
    <DurationValue value={value} align="right" primaryClassName="text-slate-700" />
  </div>
);

export function DiaLaboradoCard({ row, annual = false }) {
  const real = row.tiempoReal;
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div><strong className="block text-sm text-slate-800">{getRowTitle(row, annual)}</strong>{!annual && <span className="text-xs text-slate-500">{row.dia}</span>}</div>
        {!annual && <span className={cn('rounded-full px-2 py-1 text-[10px] font-black', row.estado === 'EN_CURSO' ? 'bg-amber-100 text-amber-700' : row.jornada === 'EXTRAORDINARIO' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600')}>{row.estado === 'EN_CURSO' ? 'EN CURSO' : row.jornada}</span>}
        {annual && row.provisional && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">EN CURSO</span>}
      </header>

      <div className="px-4 py-3">
        <span className="text-[10px] font-black uppercase text-slate-400">Tiempo real</span>
        <div className="text-2xl">
          <DurationValue value={real.totalMinutos} primaryClassName="text-marca-primario" />
        </div>
      </div>

      <div className="grid grid-cols-1 border-y border-slate-100 sm:grid-cols-2">
        <div className="px-4 py-3 sm:border-r sm:border-slate-100">
          <div className="mb-1 flex justify-between gap-3 text-xs font-black uppercase text-slate-700"><span>Actividades</span><DurationValue value={real.actividades.totalMinutos} align="right" primaryClassName="text-slate-700" /></div>
          <Line label="Reportes" value={real.actividades.reportesMinutos} />
          <Line label="Planeadas" value={real.actividades.planeadasMinutos} />
          <Line label="Extraordinarias" value={real.actividades.extraordinariasMinutos} />
        </div>
        <div className="border-t border-slate-100 px-4 py-3 sm:border-t-0">
          <div className="mb-1 flex justify-between gap-3 text-xs font-black uppercase text-slate-700"><span>Mantenimientos</span><DurationValue value={real.mantenimientos.totalMinutos} align="right" primaryClassName="text-slate-700" /></div>
          <Line label="Preventivos" value={real.mantenimientos.preventivosMinutos} />
          <Line label="Correctivos" value={real.mantenimientos.correctivosMinutos} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-3">
        <div><span className="block text-[10px] font-bold uppercase text-slate-400">Disponible</span><DurationValue value={row.tiempoDisponibleMinutos} primaryClassName="text-slate-700" /></div>
        <div><span className="block text-[10px] font-bold uppercase text-slate-400">Programado</span><DurationValue value={row.tiempoProgramadoMinutos} primaryClassName="text-slate-700" /></div>
        <div><span className="block text-[10px] font-bold uppercase text-slate-400">Real / disponible</span><strong className="text-sm text-slate-700">{formatPercent(row.realVsDisponible)}</strong>{row.provisional && row.realVsDisponible != null && <small className="block text-[9px] font-bold uppercase text-amber-600">Provisional</small>}</div>
        <div><span className="block text-[10px] font-bold uppercase text-slate-400">Real / plan</span><strong className="text-sm text-slate-700">{formatPercent(row.realVsPlan)}</strong>{row.provisional && row.realVsPlan != null && <small className="block text-[9px] font-bold uppercase text-amber-600">Provisional</small>}</div>
      </div>
    </article>
  );
}
