// src/features/tickets/pages/tickets-hoy.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { notify } from '@/components/notification/adaptive-notify';
import { useTickets } from '../hooks/use-tickets';
import { TicketsHoyDesktop } from '../views/tickets-hoy-desktop';
import { TicketsHoyMobile } from '../views/tickets-hoy-mobile';
import { HoyFormModal } from '../components/hoy/hoy-form-modal';
import { MobileHoyFormModal } from '../components/hoy/mobile-hoy-form-modal';

// ── Utilidades de fecha ──────────────────────────────────────────────────────
const getDateBounds = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    return { start, end };
};

const isOnDate = (isoStr, offset = 0) => {
    if (!isoStr) return false;
    const { start, end } = getDateBounds(offset);
    const d = new Date(isoStr);
    return d >= start && d <= end;
};

export default function TicketsHoyPage() {
    const isDesktop = useIsDesktop();
    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;

    const {
        tickets: allTickets,
        tecnicos,
        loading,
        submitting,
        fetchTickets,
        fetchTecnicos,
        createTicket,
        updateTicket,
        changeStatus,
    } = useTickets();

    const [dateOffset, setDateOffset] = useState(0); // 0 = hoy, 1 = mañana
    const [showCreate, setShowCreate] = useState(false);

    // ── Fetch: traemos activos + los que vencen hoy/mañana ─────────────────
    const loadTickets = useCallback(() => {
        // Pedimos un rango amplio de activos al backend; el filtro de fecha es local
        fetchTickets({
            limit: 200,
            // No filtramos estado para ver todas las activas asignadas
        }).catch(() => notify.error('Error al cargar las tareas.'));
    }, [fetchTickets]);

    useEffect(() => { loadTickets(); }, [loadTickets]);
    useEffect(() => { fetchTecnicos(); }, [fetchTecnicos]);

    // ── Filtro local por fecha de vencimiento ────────────────────────────────
    const ticketsFiltrados = useMemo(() => {
        return allTickets.filter((t) => isOnDate(t.fechaVencimiento, dateOffset));
    }, [allTickets, dateOffset]);

    const totalHoy = useMemo(() => allTickets.filter((t) => isOnDate(t.fechaVencimiento, 0)).length, [allTickets]);
    const totalManana = useMemo(() => allTickets.filter((t) => isOnDate(t.fechaVencimiento, 1)).length, [allTickets]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleCreate = async (payloads) => {
        const items = Array.isArray(payloads) ? payloads : [payloads];
        try {
            for (const payload of items) {
                await createTicket(payload);
            }
            notify.success(
                items.length > 1
                    ? `${items.length} tareas creadas correctamente.`
                    : 'Tarea creada correctamente.'
            );
            setShowCreate(false);
            loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al crear la tarea.';
            notify.error(msg);
            throw err;
        }
    };

    const handleUpdate = async (id, payload) => {
        try {
            await updateTicket(id, payload);
            notify.success('Tarea actualizada correctamente.');
            loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar.';
            notify.error(msg);
            throw err;
        }
    };

    const handleChangeStatus = async (id, payload) => {
        try {
            await changeStatus(id, payload);
            notify.success('Estado actualizado correctamente.');
            loadTickets();
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Error al cambiar estado.';
            notify.error(msg);
            throw err;
        }
    };

    // ── Props compartidos ────────────────────────────────────────────────────
    const sharedProps = {
        tickets: ticketsFiltrados,
        loading,
        submitting,
        currentUser,
        tecnicos,
        dateOffset,
        onDateOffsetChange: setDateOffset,
        totalHoy,
        totalManana,
        onSave: handleUpdate,
        onChangeStatus: handleChangeStatus,
        onOpenCreate: () => setShowCreate(true),
        onRefresh: loadTickets,
    };

    return (
        <div className="max-w-full mx-auto">
            {isDesktop
                ? <TicketsHoyDesktop {...sharedProps} />
                : <TicketsHoyMobile  {...sharedProps} />
            }

            {/* Modal de creación global (controlado por el padre) */}
            {isDesktop ? (
                <HoyFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    ticketAEditar={null}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                />
            ) : (
                <MobileHoyFormModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    ticketAEditar={null}
                    currentUser={currentUser}
                    tecnicos={tecnicos}
                    isSubmitting={submitting}
                    onSuccess={handleCreate}
                />
            )}
        </div>
    );
}