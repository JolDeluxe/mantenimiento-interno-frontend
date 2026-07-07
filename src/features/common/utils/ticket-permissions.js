export const ROLES_ADMIN_TICKET = ['SUPER_ADMIN', 'JEFE_MTTO', 'COORDINADOR_MTTO'];
export const ROLES_SUPERVISOR_TICKET = ['SUPER_ADMIN', 'JEFE_MTTO'];

export const ESTADOS_FINALES_TICKET = ['CERRADO', 'CANCELADA'];
export const ESTADOS_TERMINALES_TICKET = ['RESUELTO', 'CERRADO', 'CANCELADA'];

const ESTADOS_BLOQUEAN_EDICION = ['EN_PROGRESO', 'RESUELTO', ...ESTADOS_FINALES_TICKET];
const ESTADOS_BLOQUEAN_ASIGNACION = ['EN_PROGRESO', 'EN_PROCESO', 'RESUELTO', ...ESTADOS_FINALES_TICKET];

const idsIguales = (a, b) => {
    if (a == null || b == null) return false;
    return String(a) === String(b);
};

const esClienteCreador = (user, ticket) => {
    return user?.rol === 'CLIENTE_INTERNO' && idsIguales(ticket?.creadorId, user?.id);
};

const tieneResponsables = (ticket) => {
    return Array.isArray(ticket?.responsables) && ticket.responsables.length > 0;
};

export const esTecnicoResponsable = (user, ticket) => {
    if (!user || !tieneResponsables(ticket)) return false;
    return ticket.responsables.some((responsable) => idsIguales(responsable?.id, user.id));
};

export const esRolAdmin = (user) => {
    return ROLES_ADMIN_TICKET.includes(user?.rol);
};

export const puedeOperarComoTecnico = (user, ticket) => {
    if (!user || !ticket) return false;
    if (ESTADOS_TERMINALES_TICKET.includes(ticket.estado)) return false;

    const esTecnico = user.rol === 'TECNICO';
    const esResponsable = esTecnicoResponsable(user, ticket);

    return esResponsable && (esTecnico || esRolAdmin(user));
};

export const puedeCerrarAdministrativamente = (user, ticket) => {
    if (!user || !ticket) return false;

    return (
        esRolAdmin(user) &&
        !esTecnicoResponsable(user, ticket) &&
        !ESTADOS_TERMINALES_TICKET.includes(ticket.estado)
    );
};

export const puedeEditarTicket = (user, ticket) => {
    if (!user || !ticket) return false;
    if (ESTADOS_BLOQUEAN_EDICION.includes(ticket.estado)) return false;

    if (esRolAdmin(user)) return true;
    return esClienteCreador(user, ticket) && ticket.estado === 'PENDIENTE';
};

export const puedeAsignarTicket = (user, ticket) => {
    if (!user || !ticket) return false;
    if (!esRolAdmin(user)) return false;

    return !ESTADOS_BLOQUEAN_ASIGNACION.includes(ticket.estado);
};

export const puedeCancelarTicket = (user, ticket) => {
    if (!user || !ticket) return false;
    if (ESTADOS_TERMINALES_TICKET.includes(ticket.estado)) return false;

    if (esRolAdmin(user)) return true;
    return esClienteCreador(user, ticket) && ticket.estado === 'PENDIENTE';
};

export const puedeAprobarORechazar = (user, ticket) => {
    if (!user || !ticket) return false;
    if (ticket.estado !== 'RESUELTO') return false;

    if (ROLES_SUPERVISOR_TICKET.includes(user.rol)) return true;
    return esClienteCreador(user, ticket);
};
