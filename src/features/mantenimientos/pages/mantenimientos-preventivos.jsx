// src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { notify } from '@/components/notification/adaptive-notify';
import MantenimientosHistoricoPage from './mantenimientos-historico';
import { MantenimientosPreventivosDesktop } from '../views/mantenimientos-preventivos-desktop';
import { MantenimientosPreventivosMobile } from '../views/mantenimientos-preventivos-mobile';
import { ROLES_ADMIN } from '../constants';
import { useRecurrencias } from '../hooks/use-recurrencias';
import { useRecurrenciasMatriz } from '../hooks/use-recurrencias-matriz';
import { RecurrentesTabs } from '../components/recurrentes/recurrentes-tabs';
import { RecurrentesToolbar } from '../components/recurrentes/recurrentes-toolbar';
import { RecurrentesListado } from '../components/recurrentes/recurrentes-listado';
import { RecurrentesListadoMobile } from '../components/recurrentes/recurrentes-listado-mobile';
import { RecurrentesMatrizDesktop } from '../components/recurrentes/recurrentes-matriz-desktop';
import { RecurrentesMatrizMobile } from '../components/recurrentes/recurrentes-matriz-mobile';
import { RecurrenteFormModal } from '../components/recurrentes/recurrente-form-modal';
import { RecurrenteDetailModal } from '../components/recurrentes/recurrente-detail-modal';

const TicketsPreventivos = () => (
    <MantenimientosHistoricoPage
        forcedClasificacion="PREVENTIVO"
        DesktopView={MantenimientosPreventivosDesktop}
        MobileView={MantenimientosPreventivosMobile}
    />
);

const MatrizAnual = ({ canManage }) => {
    const isDesktop = useIsDesktop();
    const {
        year,
        setYear,
        filteredRows,
        total,
        loading,
        submitting,
        error,
        filters,
        responsables,
        setFilters,
        refresh,
        materializeFromCell,
    } = useRecurrenciasMatriz();

    const MatrixComponent = isDesktop ? RecurrentesMatrizDesktop : RecurrentesMatrizMobile;

    const handleGenerate = async (row) => {
        if (!window.confirm('Generar ciclo actual o vencido?')) return;
        try {
            const res = await materializeFromCell(row);
            notify.success(res?.mensaje || 'Ciclo generado.');
        } catch (err) {
            notify.error(err?.message || 'No se pudo generar ciclo.');
        }
    };

    return (
        <MatrixComponent
            year={year}
            setYear={setYear}
            rows={filteredRows}
            total={total}
            loading={loading}
            submitting={submitting}
            error={error}
            filters={filters}
            responsables={responsables}
            setFilters={setFilters}
            refresh={refresh}
            canManage={canManage}
            onGenerate={handleGenerate}
        />
    );
};

export default function MantenimientosPreventivosPage() {
    const [activeTab, setActiveTab] = useState('tickets');
    const [query, setQuery] = useState('');
    const [activo, setActivo] = useState('true');
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
    } = useRecurrencias({ activo: true, limit: 50 });

    const ListComponent = isDesktop ? RecurrentesListado : RecurrentesListadoMobile;

    const handleQueryChange = (value) => {
        setQuery(value);
        setFilters({ q: value });
    };

    const handleActivoChange = (value) => {
        setActivo(value);
        setFilters({ activo: value === '' ? undefined : value === 'true' });
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
            notify.success('Regla recurrente actualizada.');
        } else {
            await createRegla(payload);
            notify.success('Regla recurrente creada.');
        }
    };

    const handleToggleActivo = async (regla) => {
        const msg = regla.activo
            ? 'Pausar regla recurrente. No cancela tickets vivos ya creados.'
            : 'Activar regla recurrente.';
        if (!window.confirm(msg)) return;
        try {
            await toggleActivo(regla);
            notify.success(regla.activo ? 'Regla pausada.' : 'Regla activada.');
        } catch (err) {
            notify.error(err?.message || 'Error al cambiar estado.');
        }
    };

    const handleMaterialize = async (regla) => {
        if (!window.confirm('Generar ticket para ciclo actual o vencido?')) return;
        try {
            const res = await materializeRegla(regla);
            notify.success(res?.mensaje || 'Ciclo materializado.');
        } catch (err) {
            notify.error(err?.message || 'Error al materializar ciclo.');
        }
    };

    return (
        <div className="max-w-full mx-auto flex flex-col gap-4">
            <RecurrentesTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'tickets' && <TicketsPreventivos />}
            {activeTab === 'plan' && (
                <div className="flex flex-col gap-4">
                    <RecurrentesToolbar
                        query={query}
                        onQueryChange={handleQueryChange}
                        activo={activo}
                        onActivoChange={handleActivoChange}
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
                onClose={() => setDetailTarget(null)}
                regla={detailTarget}
            />
        </div>
    );
}
