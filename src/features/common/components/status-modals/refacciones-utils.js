export const sanitizeRefacciones = (refacciones = []) =>
    refacciones
        .map((ref) => ({
            nombre: String(ref.nombre || '').trim(),
            cantidad: Number(ref.cantidad) || 1,
            codigo: String(ref.codigo || '').trim(),
        }))
        .filter((ref) => ref.nombre);

export const hasValidRefacciones = (usaRefacciones, refacciones = []) =>
    !usaRefacciones || sanitizeRefacciones(refacciones).length > 0;
