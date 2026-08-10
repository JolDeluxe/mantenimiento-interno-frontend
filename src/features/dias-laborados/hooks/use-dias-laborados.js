import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getISOWeekInfo } from '@/lib/date-utils';
import { getDiasLaborados } from '../api/dias-laborados-api';

const isDiasLaboradosEnvelope = (response) => (
  response &&
  typeof response === 'object' &&
  !Array.isArray(response) &&
  (
    Object.prototype.hasOwnProperty.call(response, 'success') ||
    Object.prototype.hasOwnProperty.call(response, 'metadata') ||
    Object.prototype.hasOwnProperty.call(response, 'summary')
  )
);

const unwrapDiasLaboradosResponse = (response) => (
  isDiasLaboradosEnvelope(response) ? response : response?.data
);

const initialPeriod = () => {
  const { year, week } = getISOWeekInfo();
  return { periodo: 'SEMANA', anio: year, semana: week, mes: null };
};

export function useDiasLaborados() {
  const [selection, setSelection] = useState(initialPeriod);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const abortRef = useRef(null);
  const params = useMemo(() => ({
    periodo: selection.periodo,
    anio: selection.anio,
    ...(selection.periodo === 'SEMANA' ? { semana: selection.semana } : {}),
    ...(selection.periodo === 'MES' ? { mes: selection.mes } : {}),
    ...(revision ? { _revision: String(revision) } : {}),
  }), [revision, selection]);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    queueMicrotask(() => { setLoading(true); setError(''); });
    getDiasLaborados(params, { signal: controller.signal })
      .then((response) => setPayload(unwrapDiasLaboradosResponse(response)))
      .catch((requestError) => {
        if (requestError?.name === 'CanceledError' || requestError?.code === 'ERR_CANCELED') return;
        setError(requestError?.response?.data?.error?.message || 'No se pudieron cargar los días laborados.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [params]);

  const refresh = useCallback(() => setRevision(Date.now()), []);
  return { selection, setSelection, payload, loading, error, refresh };
}
