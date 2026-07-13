// src/features/common/forms/tareas/utils/machinery-utils.js

/**
 * Determina si se debe mostrar el bloque de maquinaria.
 * @param {object} params
 * @param {string} params.categoria
 * @param {string} params.scope
 * @returns {boolean}
 */
export const shouldShowMachineryBlock = ({ categoria, scope }) => {
    return categoria === 'MAQUINARIA' && scope !== 'actividades';
};

/**
 * Determina si se puede reportar un paro de producción.
 * @param {object} params
 * @param {string} params.categoria
 * @param {string} params.scope
 * @param {string|number} params.maquinaId
 * @param {string} params.clasificacion
 * @returns {boolean}
 */
export const canReportProductionHalt = ({ categoria, scope, maquinaId, clasificacion }) => {
    return categoria === 'MAQUINARIA' &&
        scope !== 'actividades' &&
        Boolean(maquinaId) &&
        clasificacion === 'CORRECTIVO';
};

/**
 * Deriva la ubicación (planta y área) de una máquina dada.
 * @param {object} maquina
 * @returns {object} { planta, area }
 */
export const deriveLocationFromMachine = (maquina) => {
    return {
        planta: maquina?.planta || '',
        area: maquina?.area || '',
    };
};

/**
 * Determina si la ubicación debe bloquearse según la información de la máquina.
 * @param {object} maquinaInfo
 * @returns {boolean}
 */
export const shouldLockLocationByMachine = (maquinaInfo) => {
    return Boolean(maquinaInfo);
};

export const deriveCategoryFromTicket = (ticket, fallback = '') => {
    if (ticket?.categoria) return ticket.categoria;
    if (ticket?.maquinaId || ticket?.maquina) return 'MAQUINARIA';
    return fallback;
};

export const deriveLocationFromTicket = (ticket) => {
    const maquinaLocation = deriveLocationFromMachine(ticket?.maquina);
    return {
        planta: ticket?.planta || maquinaLocation.planta || '',
        area: ticket?.area || maquinaLocation.area || '',
    };
};

export const deriveTimeModeFromTicket = (ticket) => {
    const hasRange = Boolean(ticket?.horaInicioProgramada && ticket?.horaFinProgramada);
    return {
        modoRangoHoras: hasRange,
        horaInicioProgramada: ticket?.horaInicioProgramada || null,
        horaFinProgramada: ticket?.horaFinProgramada || null,
        tiempoEstimado: hasRange ? 0 : (ticket?.tiempoEstimado ?? ticket?.tiempoEstimadoMins ?? 0),
    };
};
