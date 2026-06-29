/**
 * Lógica de permisos por acción:
 *
 * ver_detalle       → siempre visible
 * revisar_ticket    → solo estado RESUELTO + actor es admin/supervisor o cliente creador
 * editar            → admin | cliente si es creador y estado PENDIENTE
 * asignar_tecnico   → SUPER_ADMIN, JEFE_MTTO, COORDINADOR_MTTO (Bloqueado si está en proceso o posterior)
 * cambiar_estado    → admin | técnico asignado (Bloqueado si no hay responsables o está RESUELTO o finalizado)
 * cancelar_ticket   → admin | cliente si es creador y estado PENDIENTE
 */
import { TableActions } from '@/components/ui/z_index';

const ROLES_ADMIN = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
const ROLES_SUPERVISOR = ['SUPER_ADMIN', 'JEFE_MTTO'];
const ESTADOS_FINALES = ['CERRADO', 'CANCELADA'];

const puedeEditar = ({ rol, id }, ticket) => {
    // Bloqueo por estado
    if (['EN_PROGRESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado)) return false;

    if (ROLES_ADMIN.includes(rol)) return true;
    if (rol === 'CLIENTE_INTERNO' && ticket.creadorId === id && ticket.estado === 'PENDIENTE') return true;
    return false;
};

const puedeAsignar = ({ rol }, ticket) => {
    if (!ROLES_ADMIN.includes(rol)) return false;

    // Bloquear reasignación si el ticket ya está en ejecución (EN_PROGRESO, EN_PROCESO) o finalizado
    if (['EN_PROGRESO', 'EN_PROCESO', 'RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado)) return false;

    return true;
};

const puedeCambiarEstado = ({ rol, id }, ticket) => {
    // Bloqueo universal: No hay transición de estado manual posible sin un técnico responsable
    if (!ticket.responsables || ticket.responsables.length === 0) return false;

    // Bloqueo universal: Si está RESUELTO o en estado FINAL, se bloquea el cambio manual
    if (['RESUELTO', ...ESTADOS_FINALES].includes(ticket.estado)) return false;

    if (ROLES_ADMIN.includes(rol)) return true;
    if (rol === 'TECNICO') return ticket.responsables.some((r) => r.id === id);
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
 * Cancelar = forzar estado CANCELADA desde cualquier estado activo permitido.
 * Bloqueado si ya está RESUELTO, CERRADO o CANCELADA.
 * Permitido desde: PENDIENTE, ASIGNADA, EN_PROGRESO, EN_PAUSA, RECHAZADO.
 */
const puedeCancelar = ({ rol, id }, ticket) => {
    if (['RESUELTO', 'CERRADO', 'CANCELADA'].includes(ticket.estado)) return false;

    if (ROLES_ADMIN.includes(rol)) return true;
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

    // Se eliminan los retornos estáticos para estados finales.
    // TableActions iterará y solo habilitará 'ver_detalle' para CERRADO y CANCELADA.
    return (
        <TableActions
            row={ticket}
            actions={[
                { key: 'ver_detalle', enabled: true, onClick: onViewDetail },
                { key: 'revisar_ticket', enabled: puedeRevisar(currentUser, ticket), onClick: onReview },
                { key: 'editar', enabled: puedeEditar(currentUser, ticket), onClick: onEdit },
                { key: 'asignar_tecnico', enabled: puedeAsignar(currentUser, ticket), onClick: onAssign },
                { key: 'cambiar_estado', enabled: puedeCambiarEstado(currentUser, ticket), onClick: onChangeStatus },
                { key: 'cancelar_ticket', enabled: puedeCancelar(currentUser, ticket), onClick: onCancel },
            ]}
        />
    );
};