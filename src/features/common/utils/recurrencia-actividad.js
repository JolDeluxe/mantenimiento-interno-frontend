const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const normalizarFechaUTC = (fecha) => {
    if (!fecha) return null;
    const value = new Date(fecha);
    if (Number.isNaN(value.getTime())) return null;
    return value;
};

export const obtenerDatosRecurrenciaActividad = (ticketOrRecurrencia) => {
    if (!ticketOrRecurrencia) return null;
    if (ticketOrRecurrencia.unidad && ticketOrRecurrencia.intervalo && ticketOrRecurrencia.fechaInicio) {
        return ticketOrRecurrencia;
    }
    if (ticketOrRecurrencia.reglaActividadRecurrenteId == null) return null;
    return ticketOrRecurrencia.recurrenciaActividad || ticketOrRecurrencia.reglaActividadRecurrente || null;
};

export const formatearRecurrenciaActividad = (ticketOrRecurrencia) => {
    const recurrencia = obtenerDatosRecurrenciaActividad(ticketOrRecurrencia);
    if (!recurrencia) return null;

    const intervalo = Number(recurrencia.intervalo || 1);
    const fechaInicio = normalizarFechaUTC(recurrencia.fechaInicio);

    if (recurrencia.unidad === 'DIA') {
        return intervalo === 1
            ? 'Recurrente · Diaria'
            : `Recurrente · Cada ${intervalo} días`;
    }

    if (recurrencia.unidad === 'SEMANA') {
        const dia = fechaInicio ? DIAS_SEMANA[fechaInicio.getUTCDay()] : null;
        if (intervalo === 1) return dia ? `Recurrente · Cada ${dia}` : 'Recurrente · Semanal';
        return dia
            ? `Recurrente · Cada ${intervalo} semanas · ${dia}`
            : `Recurrente · Cada ${intervalo} semanas`;
    }

    if (recurrencia.unidad === 'MES') {
        const diaMes = fechaInicio?.getUTCDate();
        if (intervalo === 1) {
            return diaMes ? `Recurrente · Día ${diaMes} de cada mes` : 'Recurrente · Mensual';
        }
        return diaMes
            ? `Recurrente · Cada ${intervalo} meses · día ${diaMes}`
            : `Recurrente · Cada ${intervalo} meses`;
    }

    return 'Recurrente';
};
