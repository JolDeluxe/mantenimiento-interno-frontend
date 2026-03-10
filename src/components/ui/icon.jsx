import React from 'react';
import { cn } from '@/utils/cn';

// Diccionario de tallas corporativas
const ICON_SIZES = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '40px'
};

/**
 * Componente Core para Material Symbols Variable Fonts (Variante Rounded)
 */
export const Icon = ({ 
  name, 
  fill = false, 
  weight = 400, 
  grad = 0, 
  opsz = 24, 
  size = "md", // Cambiamos el default a la talla lógica
  className = "" 
}) => {
  // Resuelve la talla lógica ("xs") o usa el valor directo ("14px", "2rem") si no existe en el diccionario
  const resolvedSize = ICON_SIZES[size] || size;

  return (
    <span 
      className={cn("material-symbols-rounded", className)}
      style={{
        fontSize: resolvedSize,
        // Inyectamos los ejes variables directamente al estilo para que el motor de la fuente los procese
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grad}, 'opsz' ${opsz}`
      }}
    >
      {name}
    </span>
  );
};