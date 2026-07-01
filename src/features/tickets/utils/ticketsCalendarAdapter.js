// src/features/tickets/utils/ticketsCalendarAdapter.js
export const mapTicketsToCalendarItems = (tickets = []) => {
    return tickets
        .map((t) => ({
            id: String(t.id),
            date: t.fechaVencimiento ? t.fechaVencimiento.substring(0, 10) : null,
            title: t.titulo,
            colorKey: t.estado, // PENDIENTE, ASIGNADA, EN_PROGRESO, etc.
            raw: t
        }))
        .filter((item) => item.date !== null);
};
