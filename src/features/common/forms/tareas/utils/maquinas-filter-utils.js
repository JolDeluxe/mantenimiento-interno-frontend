const ESTADOS_MAQUINA_NO_OPERATIVA = new Set(['BAJA', 'BAJA_ERP', 'DESUSO', 'INACTIVA']);

export const isMaquinaOperativaParaMantenimiento = (maquina) => {
    const estado = String(maquina?.estado || '').trim().toUpperCase();
    return !ESTADOS_MAQUINA_NO_OPERATIVA.has(estado);
};

export const filterMaquinasParaMantenimiento = (maquinas = [], selectedMachineId = null) => {
    const selectedId = selectedMachineId ? String(selectedMachineId) : '';
    return maquinas.filter((maquina) => (
        isMaquinaOperativaParaMantenimiento(maquina) ||
        (selectedId && String(maquina?.id) === selectedId)
    ));
};
