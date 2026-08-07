import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getBIMaquinariaDetalle,
  getBIMaquinariaFiltros,
  getBIMaquinariaKPIs,
} from '../api/bi-maquinaria-api';
import {
  BI_ROLES,
  addDaysToDateInput,
  compactParams,
  dateInputToBIEndExclusive,
  dateInputToBIStart,
  monthStartInputMX,
  toDateInputMX,
} from '../utils/bi-maquinaria-format';

const DEFAULT_LIMIT = 25;

const getInitialFilters = (agrupacion = 'EQUIPO') => {
  const today = toDateInputMX();
  return {
    desdeInput: monthStartInputMX(),
    hastaInput: addDaysToDateInput(today, 1),
    agrupacion,
    proceso: '',
    area: '',
    buscar: '',
    pagina: 1,
    limite: DEFAULT_LIMIT,
    ordenarPor: 'DISPONIBILIDAD',
    direccion: 'ASC',
  };
};

const buildKpiParams = (filters) => compactParams({
  desde: dateInputToBIStart(filters.desdeInput),
  hasta: dateInputToBIEndExclusive(filters.hastaInput),
  agrupacion: filters.agrupacion,
  proceso: filters.proceso,
  area: filters.area,
  buscar: filters.buscar?.trim(),
  pagina: filters.pagina,
  limite: filters.limite,
  ordenarPor: filters.ordenarPor,
  direccion: filters.direccion,
});

const isApiEnvelope = (response) => (
  response &&
  typeof response === 'object' &&
  (
    Object.prototype.hasOwnProperty.call(response, 'success') ||
    Object.prototype.hasOwnProperty.call(response, 'metadata') ||
    Object.prototype.hasOwnProperty.call(response, 'resumen')
  )
);

const unwrapApiResponse = (response) => (
  isApiEnvelope(response) ? response : (response?.data || response)
);

const getErrorInfo = (error) => {
  const status = error?.response?.status;
  if (status === 401) return { status, message: 'Vuelve a iniciar sesión.' };
  if (status === 403) return { status, message: 'Tu rol actual no tiene acceso a estos indicadores.' };
  return { status: status || null, message: 'No se pudieron cargar los indicadores.' };
};

export const useBIMaquinaria = ({ userRole, enabled = true, fixedAgrupacion = null } = {}) => {
  const canUseBI = enabled && BI_ROLES.has(userRole);
  const [filters, setFilters] = useState(() => getInitialFilters(fixedAgrupacion || 'EQUIPO'));
  const [catalogs, setCatalogs] = useState({
    procesos: [],
    areas: [],
    criticidades: [],
    estadosActuales: [],
  });
  const [metadataCatalogs, setMetadataCatalogs] = useState(null);
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorInfo, setErrorInfo] = useState(null);
  const [revision, setRevision] = useState(0);
  const [detailState, setDetailState] = useState({
    maquinaId: null,
    data: null,
    loading: false,
    error: '',
    paginaEventos: 1,
  });

  const filtersAbortRef = useRef(null);
  const kpisAbortRef = useRef(null);
  const detailAbortRef = useRef(null);
  const lastDetailRefreshRevisionRef = useRef(0);

  const params = useMemo(() => ({
    ...buildKpiParams(filters),
    ...(revision > 0 ? { _revision: String(revision) } : {}),
  }), [filters, revision]);

  useEffect(() => {
    if (!fixedAgrupacion) return undefined;
    queueMicrotask(() => {
      setFilters((current) => ({
        ...current,
        agrupacion: fixedAgrupacion,
        pagina: 1,
      }));
    });
    return undefined;
  }, [fixedAgrupacion]);

  useEffect(() => {
    if (!canUseBI) return undefined;
    filtersAbortRef.current?.abort();
    const controller = new AbortController();
    filtersAbortRef.current = controller;

    getBIMaquinariaFiltros({ signal: controller.signal })
      .then((response) => {
        const payload = unwrapApiResponse(response);
        setCatalogs({
          procesos: payload?.data?.procesos || [],
          areas: payload?.data?.areas || [],
          criticidades: payload?.data?.criticidades || [],
          estadosActuales: payload?.data?.estadosActuales || [],
        });
        setMetadataCatalogs(payload?.metadata || null);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          const info = getErrorInfo(err);
          setError(info.message);
          setErrorInfo(info);
        }
      });

    return () => controller.abort();
  }, [canUseBI]);

  const loadKpis = useCallback((silent = false) => {
    if (!canUseBI) return;

    kpisAbortRef.current?.abort();
    const controller = new AbortController();
    kpisAbortRef.current = controller;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    setErrorInfo(null);

    getBIMaquinariaKPIs(params, { signal: controller.signal })
      .then((response) => {
        const payload = unwrapApiResponse(response);
        setData(payload?.data || []);
        setMetadata(payload?.metadata || null);
        setResumen(payload?.resumen || null);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          const info = getErrorInfo(err);
          setError(info.message);
          setErrorInfo(info);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, [canUseBI, params]);

  useEffect(() => {
    if (!canUseBI) return undefined;
    const delay = filters.buscar ? 350 : 0;
    const timeout = window.setTimeout(() => loadKpis(false), delay);
    return () => window.clearTimeout(timeout);
  }, [canUseBI, filters.buscar, loadKpis]);

  const updateFilters = useCallback((patch) => {
    setFilters((current) => {
      const next = {
        ...current,
        ...patch,
        pagina: patch.pagina || 1,
      };
      return next;
    });
  }, []);

  const setPage = useCallback((pagina) => {
    setFilters((current) => ({ ...current, pagina }));
  }, []);

  const refresh = useCallback(() => loadKpis(true), [loadKpis]);

  const openDetail = useCallback((maquinaId, paginaEventos = 1) => {
    if (!canUseBI || !maquinaId) return;
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;
    setDetailState({
      maquinaId,
      data: null,
      loading: true,
      error: '',
      paginaEventos,
    });

    getBIMaquinariaDetalle(maquinaId, {
      desde: dateInputToBIStart(filters.desdeInput),
      hasta: dateInputToBIEndExclusive(filters.hastaInput),
      paginaEventos,
      limiteEventos: 25,
      ...(revision > 0 ? { _revision: String(revision) } : {}),
    }, { signal: controller.signal })
      .then((response) => {
        const payload = unwrapApiResponse(response);
        setDetailState({
          maquinaId,
          data: payload,
          loading: false,
          error: '',
          paginaEventos,
        });
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setDetailState({
          maquinaId,
          data: null,
          loading: false,
          error: getErrorInfo(err).message,
          paginaEventos,
        });
      });
  }, [canUseBI, filters.desdeInput, filters.hastaInput, revision]);

  const closeDetail = useCallback(() => {
    detailAbortRef.current?.abort();
    setDetailState({
      maquinaId: null,
      data: null,
      loading: false,
      error: '',
      paginaEventos: 1,
    });
  }, []);

  useEffect(() => {
    if (!canUseBI) return undefined;

    const handleBIInvalidated = () => {
      setRevision(Date.now());
    };

    window.addEventListener('bi-maquinaria-invalidada', handleBIInvalidated);
    window.addEventListener('cuadra-sync-complete', handleBIInvalidated);

    return () => {
      window.removeEventListener('bi-maquinaria-invalidada', handleBIInvalidated);
      window.removeEventListener('cuadra-sync-complete', handleBIInvalidated);
    };
  }, [canUseBI]);

  useEffect(() => {
    if (
      !canUseBI ||
      revision === 0 ||
      lastDetailRefreshRevisionRef.current === revision ||
      !detailState.maquinaId
    ) return undefined;
    lastDetailRefreshRevisionRef.current = revision;
    queueMicrotask(() => {
      openDetail(detailState.maquinaId, detailState.paginaEventos || 1);
    });
    return undefined;
  }, [canUseBI, detailState.maquinaId, detailState.paginaEventos, openDetail, revision]);

  return {
    canUseBI,
    filters,
    catalogs,
    metadataCatalogs,
    data,
    metadata,
    resumen,
    loading,
    refreshing,
    error,
    errorInfo,
    detailState,
    params,
    updateFilters,
    setPage,
    refresh,
    openDetail,
    closeDetail,
  };
};

export const getBIMaquinariaDefaultParams = () => buildKpiParams(getInitialFilters());
