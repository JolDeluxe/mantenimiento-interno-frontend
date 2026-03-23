// src/features/tickets/components/historico/ticket-actions.jsx

/**
 * Lógica de permisos por acción:
 *
 *  ver_detalle       → siempre visible
 *  revisar_ticket    → solo estado RESUELTO + actor es admin/supervisor o cliente creador
 *  editar            → admin | cliente si es creador y estado PENDIENTE
 *  asignar_tecnico   → SUPER_ADMIN, JEFE_MTTO, COORDINADOR_MTTO
 *  cambiar_estado    → admin | técnico asignado
 *  cancelar_ticket   → supervisor | cliente si es creador y estado PENDIENTE
 */
import { TableActions } from '@/components/ui/z_index';

const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA', 'RECHAZADO'];

const puedeEditar = ({ rol, id }, ticket) => {
    if (ROLES_ADMIN.includes(rol)) return true;
    if (rol === 'CLIENTE_INTERNO' && ticket.creadorId === id && ticket.estado === 'PENDIENTE') return true;
    return false;
};

const puedeAsignar = (rol) => ROLES_ADMIN.includes(rol);

const puedeCambiarEstado = ({ rol, id }, ticket) => {
    if (ROLES_ADMIN.includes(rol)) return true;
    if (rol === 'TECNICO') return ticket.responsables?.some((r) => r.id === id) ?? false;
    return false;
};

/**
 * Revisar = el cliente o un supervisor valida si el trabajo fue correcto.
 * Solo disponible cuando estado === RESUELTO.
 * El modal de revisión le ofrece CERRAR o RECHAZAR.
 */
const puedeRevisar = ({ rol, id }, ticket) => {
    if (ticket.estado !== 'RESUELTO') return false;
    if (ROLES_SUPERVISOR.includes(rol)) return true;
    if (rol === 'CLIENTE_INTERNO' && ticket.creadorId === id) return true;
    return false;
};

/**
 * Cancelar = forzar estado CANCELADA desde cualquier estado activo.
 * Supervisor siempre. Cliente solo si es su ticket y está PENDIENTE.
 */
const puedeCancelar = ({ rol, id }, ticket) => {
    if (ESTADOS_FINALES.includes(ticket.estado)) return false;
    if (ROLES_SUPERVISOR.includes(rol)) return true;
    if (rol === 'CLIENTE_INTERNO' && ticket.creadorId === id && ticket.estado === 'PENDIENTE') return true;
    return false;
};

export const TicketActions = ({
    ticket,
    currentUser,
    onViewDetail,
    onEdit,
    onAssign,
    onChangeStatus,
    onReview,
    onCancel,
}) => {
    if (!ticket || !currentUser) return null;

    return (
        <TableActions
            row={ticket}
            actions={[
                { key: 'ver_detalle', enabled: true, onClick: onViewDetail },
                { key: 'revisar_ticket', enabled: puedeRevisar(currentUser, ticket), onClick: onReview },
                { key: 'editar', enabled: puedeEditar(currentUser, ticket), onClick: onEdit },
                { key: 'asignar_tecnico', enabled: puedeAsignar(currentUser.rol), onClick: onAssign },
                { key: 'cambiar_estado', enabled: puedeCambiarEstado(currentUser, ticket), onClick: onChangeStatus },
                { key: 'cancelar_ticket', enabled: puedeCancelar(currentUser, ticket), onClick: onCancel },
            ]}
        />
    );
};