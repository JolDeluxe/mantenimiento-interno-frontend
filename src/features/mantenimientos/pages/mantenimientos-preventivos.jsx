// src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import MantenimientosHistoricoPage from './mantenimientos-historico';
import { MantenimientosPreventivosDesktop } from '../views/mantenimientos-preventivos-desktop';
import { MantenimientosPreventivosMobile } from '../views/mantenimientos-preventivos-mobile';
import { ROLES_ADMIN } from '@/features/common/constants/catalogos-tareas';
import { useRecurrencias } from '../hooks/use-recurrencias';
import { useRecurrenciasMatriz } from '../hooks/use-recurrencias-matriz';
import { RecurrentesTabs } from '../components/recurrentes/recurrentes-tabs';
import { RecurrentesToolbar } from '../components/recurrentes/recurrentes-toolbar';
import { RecurrentesToolbarMobile } from '../components/recurrentes/recurrentes-toolbar-mobile';
import { RecurrentesListado } from '../components/recurrentes/recurrentes-listado';
import { RecurrentesListadoMobile } from '../components/recurrentes/recurrentes-listado-mobile';
import { RecurrentesMatrizDesktop } from '../components/recurrentes/recurrentes-matriz-desktop';
import { RecurrentesMatrizMobile } from '../components/recurrentes/recurrentes-matriz-mobile';
import { RecurrenteFormModal } from '../components/recurrentes/recurrente-form-modal';
import { RecurrenteDetailModal } from '../components/recurrentes/recurrente-detail-modal';
import { AjusteOcurrenciaModal } from '../components/recurrentes/ajuste-ocurrencia-modal';
import { QuitarAjusteModal } from '../components/recurrentes/quitar-ajuste-modal';

const TicketsPreventivos = () => (
    <div className="w-full min-w-0">
        <MantenimientosHistoricoPage
            forcedClasificacion="PREVENTIVO"
            DesktopView={MantenimientosPreventivosDesktop}
            MobileView={MantenimientosPreventivosMobile}
        />
    </div>
);

const MatrizAnual = ({ canManage }) => {
    const isDesktop = useIsDesktop();
    const {
        year,
        setYear,
        filteredRows,
        total,
        cobertura,
        loading,
        submitting,
        error,
        filters,
        responsables,
        setFilters,
        refresh,
        materializeFromCell,
        handleMoverOcurrencia,
        handleOmitirOcurrencia,
        handleQuitarAjuste,
    } = useRecurrenciasMatriz();
    const [adjustTarget, setAdjustTarget] = useState(null);

    const MatrixComponent = isDesktop ? RecurrentesMatrizDesktop : RecurrentesMatrizMobile;

    const handleGenerate = async (row, item) => {
        if (!window.confirm('Generar mantenimiento de este periodo?')) return;
        try {
            const res = await materializeFromCell(row, item);
            notify.success(res?.mensaje || 'Mantenimiento generado.');
        } catch (err) {
            notify.error(err?.message || 'No se pudo generar mantenimiento.');
        }
    };

    const closeAdjust = () => setAdjustTarget(null);

    const submitMove = async (data) => {
        try {
            await handleMoverOcurrencia(adjustTarget.row, data);
            notify.success('Ocurrencia movida este mes.');
            closeAdjust();
        } catch (err) {
            notify.error(err?.message || 'No se pudo mover este periodo.');
        }
    };

    const submitSkip = async (data) => {
        try {
            await handleOmitirOcurrencia(adjustTarget.row, data);
            notify.success('Ocurrencia omitida este mes.');
            closeAdjust();
        } catch (err) {
            notify.error(err?.message || 'No se pudo omitir este periodo.');
        }
    };

    const submitRemove = async (data) => {
        try {
            await handleQuitarAjuste(adjustTarget.row, data);
            notify.success('Ocurrencia volvió a la programación base.');
            closeAdjust();
        } catch (err) {
            notify.error(err?.message || 'No se pudo quitar el ajuste.');
        }
    };

    return (
        <>
            <MatrixComponent
                year={year}
                setYear={setYear}
                rows={filteredRows}
                total={total}
                cobertura={cobertura}
                loading={loading}
                submitting={submitting}
                error={error}
                filters={filters}
                responsables={responsables}
                setFilters={setFilters}
                refresh={refresh}
                canManage={canManage}
                onGenerate={handleGenerate}
                onMove={(row, item) => setAdjustTarget({ type: 'mover', row, item })}
                onSkip={(row, item) => setAdjustTarget({ type: 'omitir', row, item })}
                onRemoveAdjustment={(row, item) => setAdjustTarget({ type: 'quitar', row, item })}
            />
            <AjusteOcurrenciaModal
                isOpen={adjustTarget?.type === 'mover' || adjustTarget?.type === 'omitir'}
                mode={adjustTarget?.type}
                item={adjustTarget?.item}
                submitting={submitting}
                onClose={closeAdjust}
                onConfirm={adjustTarget?.type === 'mover' ? submitMove : submitSkip}
            />
            <QuitarAjusteModal
                isOpen={adjustTarget?.type === 'quitar'}
                item={adjustTarget?.item}
                submitting={submitting}
                onClose={closeAdjust}
                onConfirm={submitRemove}
            />
        </>
    );
};

export default function MantenimientosPreventivosPage() {
    const [activeTab, setActiveTab] = useState('tickets');
    const [query, setQuery] = useState('');
    const [activo, setActivo] = useState('true');
    const [mostrarBajaDesuso, setMostrarBajaDesuso] = useState(false);
    const [formTarget, setFormTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;
    const canManage = ROLES_ADMIN.has(currentUser?.rol);

    const {
        reglas,
        loading,
        submitting,
        error,
        createRegla,
        updateRegla,
        toggleActivo,
        materializeRegla,
        refresh,
        setFilters,
    } = useRecurrencias({ activo: true, limit: 1000 });

    const ListComponent = isDesktop ? RecurrentesListado : RecurrentesListadoMobile;
    const ToolbarComponent = isDesktop ? RecurrentesToolbar : RecurrentesToolbarMobile;

    const handleQueryChange = (value) => {
        setQuery(value);
        setFilters({ q: value });
    };

    const handleActivoChange = (value) => {
        setActivo(value);
        setFilters({ activo: value === '' ? undefined : value === 'true' });
    };

    const handleBajaDesusoChange = () => {
        const next = !mostrarBajaDesuso;
        setMostrarBajaDesuso(next);
        setFilters({ incluirBaja: next || undefined });
    };

    const openCreate = () => {
        setFormTarget(null);
        setShowForm(true);
    };

    const openEdit = (regla) => {
        setFormTarget(regla);
        setShowForm(true);
    };

    const handleSubmit = async (payload) => {
        if (formTarget) {
            await updateRegla(formTarget.id, payload);
            notify.success('Programacion preventiva actualizada.');
        } else {
            await createRegla(payload);
            notify.success('Programacion preventiva creada.');
        }
    };

    const handleToggleActivo = async (regla) => {
        const msg = regla.activo
            ? 'Pausar programacion recurrente. No cancela mantenimientos ya creados.'
            : 'Activar programacion preventiva.';
        if (!window.confirm(msg)) return;
        try {
            await toggleActivo(regla);
            notify.success(regla.activo ? 'Programacion pausada.' : 'Programacion activada.');
        } catch (err) {
            notify.error(err?.message || 'Error al cambiar estado.');
        }
    };

    const handleMaterialize = async (regla) => {
        if (!window.confirm('Generar mantenimiento de este periodo?')) return;
        try {
            const res = await materializeRegla(regla);
            notify.success(res?.mensaje || 'Mantenimiento generado.');
        } catch (err) {
            notify.error(err?.message || 'Error al generar mantenimiento.');
        }
    };

    return (
        <div className="w-full max-w-full mx-auto flex flex-col gap-4">
            <RecurrentesTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'tickets' && <TicketsPreventivos />}
            {activeTab === 'plan' && (
                <div className="flex flex-col gap-4">
                    <ToolbarComponent
                        query={query}
                        onQueryChange={handleQueryChange}
                        activo={activo}
                        onActivoChange={handleActivoChange}
                        mostrarBajaDesuso={mostrarBajaDesuso}
                        onToggleBajaDesuso={handleBajaDesusoChange}
                        onRefresh={refresh}
                        onCreate={openCreate}
                        canManage={canManage}
                        loading={loading}
                    />
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                            {error}
                        </div>
                    )}
                    <ListComponent
                        reglas={reglas}
                        loading={loading}
                        submitting={submitting}
                        canManage={canManage}
                        onView={setDetailTarget}
                        onEdit={openEdit}
                        onToggleActivo={handleToggleActivo}
                        onMaterialize={handleMaterialize}
                    />
                </div>
            )}
            {activeTab === 'matriz' && <MatrizAnual canManage={canManage} />}

            {showForm && (
                <RecurrenteFormModal
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                    onSubmit={handleSubmit}
                    regla={formTarget}
                    submitting={submitting}
                />
            )}
            <RecurrenteDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => {
                    setDetailTarget(null);
                    refresh();
                }}
                regla={detailTarget}
            />
        </div>
    );
}

