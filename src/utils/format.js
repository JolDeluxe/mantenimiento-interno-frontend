// src/utils/format.js

/**
 * Enmascara el ID de la base de datos con el prefijo corporativo.
 * @param {number} id - ID numérico real.
 * @param {string} tipo - Enum TipoTarea (TICKET, PLANEADA, EXTRAORDINARIA).
 * @returns {string} ID formateado (Ej. TK-123).
 */
export const formatPrefixedId = (id, tipo) => {
  if (!id) return '';
  
  const prefijos = {
    'TICKET': 'TK',
    'PLANEADA': 'PL',
    'EXTRAORDINARIA': 'EXT'
  };

  const prefijo = prefijos[tipo] || '#';
  return `${prefijo}-${id}`;
};