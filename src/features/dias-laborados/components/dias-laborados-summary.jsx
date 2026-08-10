import { Icon } from '@/components/ui/z_index';
import { DurationValue } from './duration-value';
import { formatPercent } from '../utils/dias-laborados-format';

const DetailLine = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span className="text-slate-500">{label}</span>
    <DurationValue value={value} align="right" primaryClassName="text-slate-700" />
  </div>
);

export function DiasLaboradosSummary({ summary }) {
  if (!summary) return null;
  const real = summary.tiempoReal;
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.15fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col justify-center bg-marca-primario px-5 py-4 text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/75">
            <Icon name="timer" size="sm" /> Tiempo real
          </div>
          <div className="mt-1 text-3xl">
            <DurationValue
              value={real.totalMinutos}
              primaryClassName="text-white"
              secondaryClassName="text-white/75"
            />
          </div>
          {summary.provisional && <span className="mt-1 text-xs font-semibold text-white/75">Incluye día en curso</span>}
        </div>

        <div className="border-b border-slate-100 px-5 py-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-xs font-black uppercase text-slate-700">Actividades</span>
            <DurationValue value={real.actividades.totalMinutos} align="right" primaryClassName="text-marca-primario" />
          </div>
          <div className="space-y-1.5">
            <DetailLine label="Reportes" value={real.actividades.reportesMinutos} />
            <DetailLine label="Planeadas" value={real.actividades.planeadasMinutos} />
            <DetailLine label="Extraordinarias" value={real.actividades.extraordinariasMinutos} />
          </div>
        </div>

        <div className="border-b border-slate-100 px-5 py-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-xs font-black uppercase text-slate-700">Mantenimientos</span>
            <DurationValue value={real.mantenimientos.totalMinutos} align="right" primaryClassName="text-marca-primario" />
          </div>
          <div className="space-y-1.5">
            <DetailLine label="Preventivos" value={real.mantenimientos.preventivosMinutos} />
            <DetailLine label="Correctivos" value={real.mantenimientos.correctivosMinutos} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4">
          <div><span className="block text-[10px] font-bold uppercase text-slate-400">Disponible</span><DurationValue value={summary.tiempoDisponibleMinutos} /></div>
          <div><span className="block text-[10px] font-bold uppercase text-slate-400">Programado</span><DurationValue value={summary.tiempoProgramadoMinutos} /></div>
          <div><span className="block text-[10px] font-bold uppercase text-slate-400">Real / disponible</span><strong className="text-sm text-slate-800">{formatPercent(summary.realVsDisponible)}</strong></div>
          <div><span className="block text-[10px] font-bold uppercase text-slate-400">Real / plan</span><strong className="text-sm text-slate-800">{formatPercent(summary.realVsPlan)}</strong></div>
        </div>
      </div>
    </section>
  );
}
