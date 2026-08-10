import { Icon } from '@/components/ui/z_index';
import { PeriodoSelector } from '@/features/common/components/periodo-selector';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DiasLaboradosSummary } from '../components/dias-laborados-summary';
import { useDiasLaborados } from '../hooks/use-dias-laborados';
import { DiasLaboradosDesktop } from '../views/dias-laborados-desktop';
import { DiasLaboradosMobile } from '../views/dias-laborados-mobile';

export default function DiasLaboradosPage() {
  const isDesktop = useIsDesktop();
  const { selection, setSelection, payload, loading, error, refresh } = useDiasLaborados();
  const rows = payload?.data || [];
  const annual = payload?.metadata?.granularidad === 'MES';
  const planQuality = payload?.calidadDatos?.tiempoProgramado;
  const hasPlanWarning = planQuality && planQuality !== 'COMPLETO';

  return (
    <main className="mx-auto flex w-full max-w-full flex-col gap-4 bg-transparent p-2 lg:p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="fuente-titulos text-2xl font-black uppercase text-slate-900">Días Laborados</h1>
          <p className="text-sm font-medium text-slate-500">Capacidad, planificación y tiempo real del equipo de mantenimiento.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          title="Actualizar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Icon name="refresh" size="sm" className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <PeriodoSelector value={selection} onChange={setSelection} disabled={loading} />

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button type="button" onClick={refresh} className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold">Reintentar</button>
        </div>
      )}

      {!error && <DiasLaboradosSummary summary={payload?.summary} />}

      {hasPlanWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          <Icon name="info" size="sm" className="mt-0.5 shrink-0" />
          {planQuality === 'HISTORICO_SIN_TIEMPO_PROGRAMADO'
            ? 'El histórico de este periodo no conserva tiempo programado. El tiempo real permanece disponible y Real / Plan se muestra como guion.'
            : 'Parte del trabajo real de este periodo no conserva tiempo programado. Los comparativos usan únicamente la planificación verificable.'}
        </div>
      )}

      {payload?.calidadDatos?.calendarioFestivos === 'NO_CONFIGURADO' && (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
          <Icon name="event_busy" size="sm" className="mt-0.5 shrink-0" />
          No existe un calendario oficial de festivos configurado; la capacidad mostrada todavía no descuenta días no laborables.
        </div>
      )}

      {!error && (isDesktop
        ? <DiasLaboradosDesktop rows={rows} annual={annual} loading={loading} />
        : <DiasLaboradosMobile rows={rows} annual={annual} loading={loading} />)}
    </main>
  );
}
