import { Spinner } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { DurationValue } from './duration-value';
import { formatDate, formatRawMinutes, formatPercent } from '../utils/dias-laborados-format';

const Breakdown = ({ total, lines }) => (
  <div className="min-w-36 text-center">
    <DurationValue value={total} align="center" />
    <span className="mt-0.5 block text-[10px] font-semibold leading-4 text-slate-400">
      {lines.map(([label, value]) => `${label} ${formatRawMinutes(value)}`).join(' · ')}
    </span>
  </div>
);

const Ratio = ({ value, provisional }) => (
  <div className="text-center">
    <strong className="text-sm text-slate-800">{formatPercent(value)}</strong>
    {provisional && value != null && <span className="block text-[9px] font-bold uppercase text-amber-600">Provisional</span>}
  </div>
);

export function DiasLaboradosTable({ rows = [], annual = false, loading = false }) {
  if (loading) return <div className="flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-white"><Spinner /></div>;
  if (!rows.length) return <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500">No hay información para el periodo.</div>;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[calc(100vh-360px)] overflow-auto">
        <table className="w-full min-w-[1180px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-[10px] uppercase text-slate-700">
            <tr>
              <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-left">{annual ? 'Mes' : 'Fecha'}</th>
              {!annual && <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-left">Día</th>}
              {!annual && <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-center">Jornada</th>}
              <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-center">Disponible</th>
              <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-center">Programado</th>
              <th colSpan="3" className="border-b border-r border-slate-200 px-3 py-2 text-center">Tiempo real</th>
              <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-3 text-center">Real / disponible</th>
              <th rowSpan="2" className="border-b border-slate-200 px-3 py-3 text-center">Real / plan</th>
            </tr>
            <tr>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center">Total</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center">Actividades</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center">Mantenimientos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const real = row.tiempoReal;
              return (
                <tr key={annual ? row.periodo : row.fecha} className="bg-white hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-bold text-slate-800">{annual ? row.mesNombre : formatDate(row.fecha)}</td>
                  {!annual && <td className="px-3 py-3 text-slate-600">{row.dia}</td>}
                  {!annual && (
                    <td className="px-3 py-3 text-center">
                      <span className={cn('inline-flex rounded-full px-2 py-1 text-[10px] font-bold', row.estado === 'EN_CURSO' ? 'bg-amber-50 text-amber-700' : row.jornada === 'EXTRAORDINARIO' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600')}>
                        {row.estado === 'EN_CURSO' ? 'EN CURSO' : row.jornada}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-3 text-center"><DurationValue value={row.tiempoDisponibleMinutos} align="center" primaryClassName="text-slate-700" /></td>
                  <td className="px-3 py-3 text-center"><DurationValue value={row.tiempoProgramadoMinutos} align="center" primaryClassName="text-slate-700" /></td>
                  <td className="px-3 py-3 text-center text-base"><DurationValue value={real.totalMinutos} align="center" primaryClassName="text-marca-primario" /></td>
                  <td className="px-3 py-3"><Breakdown total={real.actividades.totalMinutos} lines={[["Rep", real.actividades.reportesMinutos], ["Plan", real.actividades.planeadasMinutos], ["Ext", real.actividades.extraordinariasMinutos]]} /></td>
                  <td className="px-3 py-3"><Breakdown total={real.mantenimientos.totalMinutos} lines={[["Prev", real.mantenimientos.preventivosMinutos], ["Corr", real.mantenimientos.correctivosMinutos]]} /></td>
                  <td className="px-3 py-3"><Ratio value={row.realVsDisponible} provisional={row.provisional} /></td>
                  <td className="px-3 py-3"><Ratio value={row.realVsPlan} provisional={row.provisional} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
