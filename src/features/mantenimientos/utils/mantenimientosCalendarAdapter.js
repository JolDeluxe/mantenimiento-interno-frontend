// src/features/mantenimientos/utils/mantenimientosCalendarAdapter.js
export const mapMantenimientosToCalendarItems = (mantenimientos = []) => {
    return mantenimientos
        .map((m) => ({
            id: String(m.id),
            date: m.fechaVencimiento ? m.fechaVencimiento.substring(0, 10) : null,
            title: m.titulo,
            colorKey: m.estado, // PENDIENTE, ASIGNADA, EN_PROGRESO, etc.
            raw: m
        }))
        .filter((item) => item.date !== null);
};
