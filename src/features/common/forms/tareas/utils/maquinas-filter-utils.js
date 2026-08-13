const ESTADOS_MAQUINA_NO_SELECCIONABLE = new Set(['BAJA', 'BAJA_ERP']);

export const isMaquinaOperativaParaMantenimiento = (maquina) => {
    const estado = String(maquina?.estado || '').trim().toUpperCase();
    return !ESTADOS_MAQUINA_NO_SELECCIONABLE.has(estado);
};

export const filterMaquinasParaMantenimiento = (maquinas = []) => (
    maquinas.filter(isMaquinaOperativaParaMantenimiento)
);

export const normalizeMaquinasResponse = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
};

export const buildMaquinaOptions = (maquinas = []) => maquinas.map((maquina) => ({
    value: String(maquina.id),
    label: `${maquina.codigo || 'SIN CODIGO'} - ${maquina.nombre || 'Sin nombre'}`,
    ...maquina,
}));
