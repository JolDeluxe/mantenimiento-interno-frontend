import { useEffect, useState } from 'react';
import { Icon, Spinner } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { getBIMaquinariaDetalle } from '@/features/maquinaria/api/bi-maquinaria-api';
import {
  BI_ROLES,
  dateInputToBIEndExclusive,
  dateInputToBIStart,
  addDaysToDateInput,
  monthStartInputMX,
  toDateInputMX,
  formatDays,
  formatInteger,
  formatMinutes,
  formatPercent,
} from '@/features/maquinaria/utils/bi-maquinaria-format';

export function MaquinaBIContext({ maquinaId }) {
  const { user } = useAuthStore();
  const currentUser = user?.data || user;
  const canUseBI = BI_ROLES.has(currentUser?.rol || currentUser?.role);
  const [state, setState] = useState({ loading: false, data: null, error: '' });

  useEffect(() => {
    if (!canUseBI || !maquinaId) {
      queueMicrotask(() => setState({ loading: false, data: null, error: '' }));
      return undefined;
    }

    const controller = new AbortController();
    const today = toDateInputMX();
    queueMicrotask(() => setState({ loading: true, data: null, error: '' }));

    getBIMaquinariaDetalle(maquinaId, {
      desde: dateInputToBIStart(monthStartInputMX()),
      hasta: dateInputToBIEndExclusive(addDaysToDateInput(today, 1)),
      paginaEventos: 1,
      limiteEventos: 5,
    }, { signal: controller.signal })
      .then((response) => setState({ loading: false, data: response?.data || response, error: '' }))
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setState({ loading: false, data: null, error: 'Indicadores no disponibles.' });
      });

    return () => controller.abort();
  }, [canUseBI, maquinaId]);

  if (!canUseBI || !maquinaId) return null;

  if (state.loading) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
        <Spinner size="xs" />
        Cargando indicadores...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
        <Icon name="info" size="xs" />
        {state.error}
      </div>
    );
  }

  const metricas = state.data?.metricas;
  if (!metricas) return null;

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
        <Icon name="analytics" size="xs" className="text-marca-primario" />
        Indicadores del mes
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 sm:grid-cols-4">
        <span>Fallas <strong className="text-slate-900">{formatInteger(metricas.frecuencia?.valor, '0')}</strong></span>
        <span>MTTR técnico <strong className="text-slate-900">{formatMinutes(metricas.mttr?.valorMinutos)}</strong></span>
        <span>MTBF <strong className="text-slate-900">{formatDays(metricas.mtbf?.valorDias)}</strong></span>
        <span>Disp. <strong className="text-slate-900">{formatPercent(metricas.disponibilidad?.valorPorcentaje)}</strong></span>
      </div>
    </div>
  );
}
