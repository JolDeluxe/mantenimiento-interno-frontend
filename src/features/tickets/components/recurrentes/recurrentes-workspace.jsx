import { useCallback, useEffect, useMemo, useState } from 'react';
import { GlassPaginationPill, Pagination } from '@/components/ui/z_index';
import { notify } from '@/components/notification/adaptive-notify';
import { getAsignables } from '@/features/tickets/api/tickets-api';
import { useActividadesRecurrentes } from '../../hooks/use-actividades-recurrentes';
import { AjusteOcurrenciaModal } from './ajuste-ocurrencia-modal';
import { MaterializarOcurrenciaModal } from './materializar-ocurrencia-modal';
import { QuitarAjusteModal } from './quitar-ajuste-modal';
import { RecurrenteDetailModal } from './recurrente-detail-modal';
import { RecurrenteFormModal } from './recurrente-form-modal';
import { RecurrenteLifecycleModal } from './recurrente-lifecycle-modal';
import { RecurrentesListado } from './recurrentes-listado';
import { RecurrentesListadoMobile } from './recurrentes-listado-mobile';
import { RecurrentesToolbar } from './recurrentes-toolbar';
import { RecurrentesToolbarMobile } from './recurrentes-toolbar-mobile';
import { datePart, getOccurrenceOriginalDate } from './recurrentes-utils';

const LIMIT = 50;

const INITIAL_FILTERS = {
    activo: '',
    incluirArchivadas: false,
    categoria: '',
    area: '',
    responsableId: '',
    unidad: '',
};

const queryFromFilters = (query, filters, page) => ({
    page,
    limit: LIMIT,
    q: query || undefined,
    activo: filters.activo && filters.activo !== 'all' ? filters.activo : undefined,
    incluirArchivadas: filters.incluirArchivadas || undefined,
    categoria: filters.categoria || undefined,
    area: filters.area || undefined,
    responsableId: filters.responsableId || undefined,
    unidad: filters.unidad || undefined,
});

export const RecurrentesWorkspace = ({ onMaterialized, isMobile = false, canManage = false }) => {
    const hook = useActividadesRecurrentes();
    const { fetchReglas } = hook;
    const [tecnicos, setTecnicos] = useState([]);
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const [form, setForm] = useState(null);
    const [detail, setDetail] = useState(null);
    const [lifecycle, setLifecycle] = useState(null);
    const [materializeTarget, setMaterializeTarget] = useState(null);
    const [adjustment, setAdjustment] = useState(null);
    const [removeAdjustment, setRemoveAdjustment] = useState(null);
    const [actionError, setActionError] = useState('');

    const queryPayload = useMemo(() => queryFromFilters(query, filters, page), [filters, page, query]);
    const queryKey = useMemo(() => JSON.stringify(queryPayload), [queryPayload]);

    const refresh = useCallback(() => fetchReglas(JSON.parse(queryKey)), [fetchReglas, queryKey]);

    useEffect(() => {
        getAsignables().then(setTecnicos).catch(() => setTecnicos([]));
    }, []);

    useEffect(() => {
        refresh().catch(() => {});
    }, [refresh]);

    const setFiltersAndResetPage = useCallback((nextFilters) => {
        setFilters(nextFilters);
        setPage(1);
    }, []);

    const setQueryAndResetPage = useCallback((nextQuery) => {
        setQuery(nextQuery);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setQuery('');
        setFilters(INITIAL_FILTERS);
        setPage(1);
    }, []);

    const resetListAfterCreate = useCallback(() => {
        setQuery('');
        setFilters(INITIAL_FILTERS);
        setPage(1);
    }, []);

    const execute = async (work, success, after) => {
        setActionError('');
        try {
            await work();
            notify.success(success);
            await refresh();
            await after?.();
            return true;
        } catch (error) {
            const message = error?.message || 'No se pudo completar la operacion.';
            setActionError(message);
            notify.error(message);
            return false;
        }
    };

    const materialize = async (occurrence) => {
        const fechaCicloLogica = getOccurrenceOriginalDate(occurrence)
            || datePart(materializeTarget?.proximaFechaEjecucion);
        return execute(
            () => hook.materializar(materializeTarget.id, { fechaCicloLogica, confirmarFuturo: true }),
            'Tarea generada.',
            async () => {
                setMaterializeTarget(null);
                await onMaterialized?.();
            }
        );
    };

    const applyAdjustment = async (payload) => execute(
        () => adjustment.mode === 'mover' ? hook.mover(detail.id, payload) : hook.omitir(detail.id, payload),
        adjustment.mode === 'mover' ? 'Fecha programada actualizada.' : 'Fecha programada omitida.',
        () => setAdjustment(null)
    );

    const remove = async () => execute(
        () => hook.quitarAjuste(detail.id, { fechaOriginal: getOccurrenceOriginalDate(removeAdjustment) }),
        'Ajuste eliminado.',
        () => setRemoveAdjustment(null)
    );

    const lifecycleConfirm = async () => {
        const { regla, action } = lifecycle;
        const operation = action === 'pausar' || action === 'reactivar'
            ? () => hook.setActivo(regla.id, action === 'reactivar')
            : action === 'cancelar'
                ? () => hook.cancelar(regla.id)
                : () => hook.restaurar(regla.id);
        const ok = await execute(
            operation,
            action === 'cancelar'
                ? 'Recurrencia cancelada. Las tareas existentes se conservaron.'
                : action === 'restaurar'
                    ? 'Recurrencia restaurada y pausada.'
                    : action === 'pausar'
                        ? 'Recurrencia pausada.'
                        : 'Recurrencia reactivada.'
        );
        if (ok) setLifecycle(null);
    };

    const openDetail = (regla) => {
        setDetail(regla);
        setActionError('');
    };

    const listActions = {
        submitting: hook.submitting,
        canManage,
        onView: openDetail,
        onEdit: setForm,
        onToggleActivo: (regla) => {
            setActionError('');
            setLifecycle({ regla, action: regla.activo ? 'pausar' : 'reactivar' });
        },
        onCancel: (regla) => {
            setActionError('');
            setLifecycle({ regla, action: 'cancelar' });
        },
        onRestore: (regla) => {
            setActionError('');
            setLifecycle({ regla, action: 'restaurar' });
        },
    };

    const Toolbar = isMobile ? RecurrentesToolbarMobile : RecurrentesToolbar;
    const totalPages = hook.pagination?.totalPages || 1;
    const total = hook.pagination?.total || 0;

    return (
        <section className={isMobile ? 'flex w-full min-w-0 flex-col gap-4 px-1 pt-1 pb-44' : 'flex w-full min-w-0 flex-col gap-4 pb-32'}>
            {!isMobile && (
                <div>
                    <h2 className="fuente-titulos text-2xl uppercase tracking-wide text-marca-primario">Actividades recurrentes</h2>
                    <p className="mt-0.5 text-sm text-slate-555">
                        {hook.loading ? 'Cargando...' : `${total} ${total !== 1 ? 'actividades' : 'actividad'} recurrente${total !== 1 ? 's' : ''}`}
                    </p>
                </div>
            )}

            <Toolbar
                query={query}
                onQueryChange={setQueryAndResetPage}
                filters={filters}
                onFiltersChange={setFiltersAndResetPage}
                tecnicos={tecnicos}
                onRefresh={refresh}
                onCreate={() => setForm({})}
                onClearFilters={clearFilters}
                loading={hook.loading}
                canManage={canManage}
            />

            {hook.error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                    {hook.error}
                </div>
            )}

            {isMobile ? (
                <RecurrentesListadoMobile reglas={hook.reglas} loading={hook.loading} {...listActions} />
            ) : (
                <RecurrentesListado reglas={hook.reglas} loading={hook.loading} {...listActions} />
            )}

            {totalPages > 1 && !isMobile && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={total}
                    onPageChange={setPage}
                    loading={hook.loading}
                />
            )}
            {totalPages > 1 && isMobile && (
                <div className="lg:hidden">
                    <GlassPaginationPill
                        page={page}
                        totalPages={totalPages}
                        totalItems={total}
                        onPageChange={setPage}
                        loading={hook.loading}
                        bottom="calc(80px + var(--safe-bottom-offset, 0px))"
                    />
                </div>
            )}

            <RecurrenteFormModal
                key={form?.id ?? 'new'}
                isOpen={form !== null}
                regla={form?.id ? form : null}
                tecnicos={tecnicos}
                submitting={hook.submitting}
                onClose={() => setForm(null)}
                onSubmit={async (data) => {
                    const isEdit = Boolean(form?.id);
                    const result = isEdit ? await hook.update(form.id, data) : await hook.create(data);
                    notify.success(isEdit ? 'Regla actualizada.' : 'Regla creada.');
                    if (!isEdit) resetListAfterCreate();
                    return result;
                }}
            />
            <RecurrenteDetailModal
                regla={detail}
                isOpen={Boolean(detail)}
                onClose={() => setDetail(null)}
                loadDetail={hook.detalle}
                loadProyecciones={hook.proyecciones}
                loadAjustes={hook.ajustes}
                canManage={canManage}
                submitting={hook.submitting}
                onMaterialize={(occurrence) => setMaterializeTarget({ ...detail, occurrence })}
                onMove={(occurrence) => setAdjustment({ mode: 'mover', occurrence })}
                onOmit={(occurrence) => setAdjustment({ mode: 'omitir', occurrence })}
                onRemove={setRemoveAdjustment}
            />
            <MaterializarOcurrenciaModal
                regla={materializeTarget}
                isOpen={Boolean(materializeTarget)}
                submitting={hook.submitting}
                error={actionError}
                onClose={() => { setMaterializeTarget(null); setActionError(''); }}
                onConfirm={() => materialize(materializeTarget?.occurrence)}
            />
            <AjusteOcurrenciaModal
                key={`${adjustment?.mode ?? 'none'}-${adjustment?.occurrence?.fechaCicloLogica ?? 'none'}`}
                mode={adjustment?.mode}
                occurrence={adjustment?.occurrence}
                isOpen={Boolean(adjustment)}
                submitting={hook.submitting}
                error={actionError}
                onClose={() => { setAdjustment(null); setActionError(''); }}
                onConfirm={applyAdjustment}
            />
            <QuitarAjusteModal
                occurrence={removeAdjustment}
                isOpen={Boolean(removeAdjustment)}
                submitting={hook.submitting}
                error={actionError}
                onClose={() => { setRemoveAdjustment(null); setActionError(''); }}
                onConfirm={remove}
            />
            <RecurrenteLifecycleModal
                regla={lifecycle?.regla}
                action={lifecycle?.action}
                isOpen={Boolean(lifecycle)}
                submitting={hook.submitting}
                error={actionError}
                onClose={() => { setLifecycle(null); setActionError(''); }}
                onConfirm={lifecycleConfirm}
            />
        </section>
    );
};
