// src/features/calendario/pages/calendario-page.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useCalendario } from '../hooks/use-calendario';
import { mapTicketsToCalendarItems } from '../utils/calendarioAdapter';
import { CalendarioDesktop } from '../views/calendario-desktop';
import { CalendarioMobile } from '../views/calendario-mobile';

// ── Modales Comunes y Detalle ──────────────────────────────────────────────
import { TicketDetailModal } from '@/features/common/components/ticket-detail-modal';
import { TicketAssignModal } from '@/features/common/components/ticket-assign-modal';

// ── Modales específicos de Tickets / Actividades ──────────────────────────
import { TicketFormModal } from '@/features/tickets/components/historico/ticket-form-modal';
import { MobileTicketFormModal } from '@/features/tickets/components/historico/mobile-ticket-form-modal';
import { TicketStatusModal } from '@/features/common/components/status-modal';
import { TicketReviewModal } from '@/features/tickets/components/historico/ticket-review-modal';
import { MobileTicketReviewModal } from '@/features/tickets/components/historico/mobile-ticket-review-modal';
import { 
    createTicket, 
    updateTicket, 
    changeTicketStatus 
} from '@/features/tickets/api/tickets-api';

// ── Modales específicos de Mantenimiento (TPM) ─────────────────────────────
import { MantenimientosFormModal } from '@/features/mantenimientos/components/common/mantenimientos-form-modal';
import { MobileMantenimientosFormModal } from '@/features/mantenimientos/components/common/mobile-mantenimientos-form-modal';
import { MantenimientosStatusModal } from '@/features/mantenimientos/components/common/mantenimientos-status-modal';
import { MantenimientosReviewModal } from '@/features/mantenimientos/components/common/mantenimientos-review-modal';
import { MobileMantenimientosReviewModal } from '@/features/mantenimientos/components/common/mobile-mantenimientos-review-modal';
import { 
    createMantenimiento, 
    updateMantenimiento, 
    changeMantenimientoStatus 
} from '@/features/mantenimientos/api/mantenimientos-api';

export default function CalendarioPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        tickets,
        tecnicos,
        loading,
        submitting,
        setSubmitting,
        metricas,
        isOffline,
        calendarDate,
        setCalendarDate,
        calendarView,
        setCalendarView,
        scope,
        setScope,
        filtroEstado,
        setFiltroEstado,
        filtroTipo,
        setFiltroTipo,
        filtroPrioridad,
        setFiltroPrioridad,
        filtroCategoria,
        setFiltroCategoria,
        filtroClasificacion,
        setFiltroClasificacion,
        filtroResponsable,
        setFiltroResponsable,
        filtroPlanta,
        setFiltroPlanta,
        filtroArea,
        setFiltroArea,
        query,
        setQuery,
        handleClearFilters,
        refresh
    } = useCalendario();

    // Objetivos/Target de Modales activos
    const [detailTarget, setDetailTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [assignTarget, setAssignTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [calendarCreateDate, setCalendarCreateDate] = useState(null);

    // Mapear los datos de API a items compatibles con el calendario
    const calendarItems = useMemo(() => {
        return mapTicketsToCalendarItems(tickets);
    }, [tickets]);

    // Comprobación rápida para saber si el item actual es de tipo mantenimiento
    const checkIsMantenimiento = useCallback((item) => {
        if (!item) return false;
        return Boolean(item.maquinaId || item.maquina || item.scope === 'mantenimientos' || item.scope === 'mantenimiento');
    }, []);

    // Determina si hay algún filtro activo
    const isFiltering = useMemo(() => {
        return (
            scope !== 'general' ||
            filtroEstado !== 'TODOS' ||
            filtroTipo !== '' ||
            filtroPrioridad !== '' ||
            filtroCategoria !== '' ||
            filtroClasificacion !== '' ||
            filtroResponsable !== '' ||
            filtroPlanta !== '' ||
            filtroArea !== '' ||
            query !== ''
        );
    }, [scope, filtroEstado, filtroTipo, filtroPrioridad, filtroCategoria, filtroClasificacion, filtroResponsable, filtroPlanta, filtroArea, query]);

    // ── Handlers de Escritura / Mutaciones ────────────────────────────────
    
    const handleCreate = async (payload) => {
        setSubmitting(true);
        try {
            // Evaluamos el scope del filtro activo para decidir qué tipo de tarea crear
            if (scope === 'mantenimientos') {
                await createMantenimiento(payload);
            } else {
                await createTicket(payload);
            }
            notify.success('Tarea creada correctamente.');
            setShowCreate(false);
            setCalendarCreateDate(null);
            refresh();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al crear la tarea.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSave = async (id, payload) => {
        setSubmitting(true);
        const isMtto = checkIsMantenimiento(editTarget || assignTarget);
        try {
            if (isMtto) {
                await updateMantenimiento(id, payload);
            } else {
                await updateTicket(id, payload);
            }
            notify.success('Tarea actualizada correctamente.');
            setEditTarget(null);
            setAssignTarget(null);
            refresh();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangeStatus = async (id, payload) => {
        setSubmitting(true);
        const isMtto = checkIsMantenimiento(statusTarget || reviewTarget || cancelTarget);
        try {
            if (isMtto) {
                await changeMantenimientoStatus(id, payload);
            } else {
                await changeTicketStatus(id, payload);
            }
            notify.success('Estado actualizado correctamente.');
            setStatusTarget(null);
            setReviewTarget(null);
            setCancelTarget(null);
            refresh();
        } catch (err) {
            notify.error(err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseCreate = useCallback(() => {
        setShowCreate(false);
        setCalendarCreateDate(null);
    }, []);

    // Props compartidas entre las vistas Desktop y Mobile
    const sharedProps = {
        currentUser,
        calendarItems,
        calendarDate,
        onCalendarNavigate: setCalendarDate,
        calendarView,
        onCalendarViewChange: setCalendarView,
        onCalendarDayClick: (dStr) => {
            setCalendarCreateDate(dStr);
            setShowCreate(true);
        },
        onCalendarItemClick: (item) => {
            setDetailTarget(item.raw);
        },
        loading,
        tecnicos,
        setEditTarget,
        setAssignTarget,
        setStatusTarget,
        setReviewTarget,
        setCancelTarget,
        scope,
        onScopeChange: setScope,
        filtroEstado,
        onFilterChange: setFiltroEstado,
        filtroTipo,
        onTipoChange: setFiltroTipo,
        filtroPrioridad,
        onPrioridadChange: setFiltroPrioridad,
        filtroCategoria,
        onCategoriaChange: setFiltroCategoria,
        filtroClasificacion,
        onClasificacionChange: setFiltroClasificacion,
        filtroResponsable,
        onResponsableChange: setFiltroResponsable,
        filtroPlanta,
        onPlantaChange: setFiltroPlanta,
        filtroArea,
        onAreaChange: setFiltroArea,
        query,
        onSearchChange: setQuery,
        onClearFilters: handleClearFilters,
        isFiltering
    };

    // Banderas de decisión para renderizado inteligente de modales específicos
    const isEditMantenimiento = checkIsMantenimiento(editTarget);
    const isStatusMantenimiento = checkIsMantenimiento(statusTarget || cancelTarget);
    const isReviewMantenimiento = checkIsMantenimiento(reviewTarget);

    return (
        <div className="max-w-full mx-auto">
            {/* Ruteo de vistas responsivas */}
            {isDesktop ? (
                <CalendarioDesktop {...sharedProps} />
            ) : (
                <CalendarioMobile {...sharedProps} />
            )}

            {/* 1. Modal de Detalle (Común) */}
            <TicketDetailModal
                isOpen={Boolean(detailTarget)}
                onClose={() => setDetailTarget(null)}
                ticket={detailTarget}
            />

            {/* 2. Modal de Asignación (Común) */}
            <TicketAssignModal
                isOpen={Boolean(assignTarget)}
                onClose={() => setAssignTarget(null)}
                ticket={assignTarget}
                tecnicos={tecnicos}
                isSubmitting={submitting}
                onConfirm={handleSave}
            />

            {/* 3. Modales de Creación (Ruteo Dinámico según Scope) */}
            {showCreate && (
                scope === 'mantenimientos' ? (
                    isDesktop ? (
                        <MantenimientosFormModal
                            isOpen={showCreate}
                            onClose={handleCloseCreate}
                            ticketAEditar={null}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={handleCreate}
                            defaultDate={calendarCreateDate}
                        />
                    ) : (
                        <MobileMantenimientosFormModal
                            isOpen={showCreate}
                            onClose={handleCloseCreate}
                            ticketAEditar={null}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={handleCreate}
                            defaultDate={calendarCreateDate}
                        />
                    )
                ) : (
                    isDesktop ? (
                        <TicketFormModal
                            isOpen={showCreate}
                            onClose={handleCloseCreate}
                            ticketAEditar={null}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={handleCreate}
                            scope="actividades"
                            defaultDate={calendarCreateDate}
                        />
                    ) : (
                        <MobileTicketFormModal
                            isOpen={showCreate}
                            onClose={handleCloseCreate}
                            ticketAEditar={null}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={handleCreate}
                            scope="actividades"
                            defaultDate={calendarCreateDate}
                        />
                    )
                )
            )}

            {/* 4. Modales de Edición (Ruteo Dinámico según tipo de ítem seleccionado) */}
            {editTarget && (
                isEditMantenimiento ? (
                    isDesktop ? (
                        <MantenimientosFormModal
                            isOpen={Boolean(editTarget)}
                            onClose={() => setEditTarget(null)}
                            ticketAEditar={editTarget}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={(payload) => handleSave(editTarget.id, payload)}
                        />
                    ) : (
                        <MobileMantenimientosFormModal
                            isOpen={Boolean(editTarget)}
                            onClose={() => setEditTarget(null)}
                            ticketAEditar={editTarget}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={(payload) => handleSave(editTarget.id, payload)}
                        />
                    )
                ) : (
                    isDesktop ? (
                        <TicketFormModal
                            isOpen={Boolean(editTarget)}
                            onClose={() => setEditTarget(null)}
                            ticketAEditar={editTarget}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={(payload) => handleSave(editTarget.id, payload)}
                            scope="actividades"
                        />
                    ) : (
                        <MobileTicketFormModal
                            isOpen={Boolean(editTarget)}
                            onClose={() => setEditTarget(null)}
                            ticketAEditar={editTarget}
                            currentUser={currentUser}
                            tecnicos={tecnicos}
                            isSubmitting={submitting}
                            onSuccess={(payload) => handleSave(editTarget.id, payload)}
                            scope="actividades"
                        />
                    )
                )
            )}

            {/* 5. Modales de Cambio de Estado (Ruteo Dinámico según item) */}
            {statusTarget && (
                isStatusMantenimiento ? (
                    <MantenimientosStatusModal
                        isOpen={Boolean(statusTarget)}
                        onClose={() => setStatusTarget(null)}
                        ticket={statusTarget}
                        currentUser={currentUser}
                        isSubmitting={submitting}
                        onConfirm={handleChangeStatus}
                    />
                ) : (
                    <TicketStatusModal
                        isOpen={Boolean(statusTarget)}
                        onClose={() => setStatusTarget(null)}
                        ticket={statusTarget}
                        currentUser={currentUser}
                        isSubmitting={submitting}
                        onConfirm={handleChangeStatus}
                    />
                )
            )}

            {/* 6. Modales de Cancelación (Ruteo Dinámico según item) */}
            {cancelTarget && (
                isStatusMantenimiento ? (
                    <MantenimientosStatusModal
                        isOpen={Boolean(cancelTarget)}
                        onClose={() => setCancelTarget(null)}
                        ticket={cancelTarget}
                        currentUser={currentUser}
                        isSubmitting={submitting}
                        forcedEstado="CANCELADA"
                        onConfirm={handleChangeStatus}
                    />
                ) : (
                    <TicketStatusModal
                        isOpen={Boolean(cancelTarget)}
                        onClose={() => setCancelTarget(null)}
                        ticket={cancelTarget}
                        currentUser={currentUser}
                        isSubmitting={submitting}
                        forcedEstado="CANCELADA"
                        onConfirm={handleChangeStatus}
                    />
                )
            )}

            {/* 7. Modales de Revisión (Ruteo Dinámico según item) */}
            {reviewTarget && (
                isReviewMantenimiento ? (
                    isDesktop ? (
                        <MantenimientosReviewModal
                            isOpen={Boolean(reviewTarget)}
                            onClose={() => setReviewTarget(null)}
                            ticket={reviewTarget}
                            isSubmitting={submitting}
                            currentUser={currentUser}
                            onConfirm={handleChangeStatus}
                        />
                    ) : (
                        <MobileMantenimientosReviewModal
                            isOpen={Boolean(reviewTarget)}
                            onClose={() => setReviewTarget(null)}
                            ticket={reviewTarget}
                            isSubmitting={submitting}
                            currentUser={currentUser}
                            onConfirm={handleChangeStatus}
                        />
                    )
                ) : (
                    isDesktop ? (
                        <TicketReviewModal
                            isOpen={Boolean(reviewTarget)}
                            onClose={() => setReviewTarget(null)}
                            ticket={reviewTarget}
                            isSubmitting={submitting}
                            currentUser={currentUser}
                            onConfirm={handleChangeStatus}
                        />
                    ) : (
                        <MobileTicketReviewModal
                            isOpen={Boolean(reviewTarget)}
                            onClose={() => setReviewTarget(null)}
                            ticket={reviewTarget}
                            isSubmitting={submitting}
                            currentUser={currentUser}
                            onConfirm={handleChangeStatus}
                        />
                    )
                )
            )}
        </div>
    );
}