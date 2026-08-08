import { Spinner } from '@/components/ui/z_index';
import { DiaLaboradoCard } from '../components/dia-laborado-card';

export function DiasLaboradosMobile({ rows, annual, loading }) {
  if (loading) return <div className="flex min-h-48 items-center justify-center"><Spinner /></div>;
  if (!rows.length) return <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No hay información para el periodo.</div>;
  return <div className="flex flex-col gap-3 pb-24">{rows.map((row) => <DiaLaboradoCard key={annual ? row.periodo : row.fecha} row={row} annual={annual} />)}</div>;
}

