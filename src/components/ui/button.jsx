import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

// Ubicación sugerida: frontend/src/components/ui/button.jsx

const variants = {
  // --- Existentes ---
  primario: 'bg-marca-primario hover:bg-marca-primario-hover text-white',
  guardar: 'bg-estado-resuelto hover:brightness-110 text-white',
  editar: 'bg-prioridad-media hover:brightness-110 text-white',
  accion: 'bg-estado-asignada hover:brightness-110 text-white',
  borrar: 'bg-estado-rechazado hover:brightness-110 text-white',
  cancelar: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
  ghost: 'bg-transparent border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900',

  // --- Nuevas Variantes de Negocio ---
  pendiente: 'bg-estado-pendiente hover:brightness-110 text-white',
  progreso: 'bg-estado-en-progreso hover:brightness-110 text-white',
  pausa: 'bg-estado-en-pausa hover:brightness-110 text-white',
  detener: 'bg-prioridad-alta hover:brightness-110 text-white',
  critico: 'bg-prioridad-critica hover:brightness-110 text-white animate-pulse',

  // --- ESCALA DE GRISES Y NEUTROS (Variedad) ---
  dark: 'bg-slate-900 hover:bg-black text-white shadow-md', // Negro profundo
  carbon: 'bg-slate-700 hover:bg-slate-800 text-slate-50', // Gris muy oscuro
  gris: 'bg-slate-500 hover:bg-slate-600 text-white', // Gris estándar
  silver: 'bg-slate-300 hover:bg-slate-400 text-slate-700', // Gris medio
  light: 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200', // Gris muy claro
  soft: 'bg-white hover:bg-slate-100 text-slate-400 border border-transparent hover:border-slate-200', // Casi blanco

  // --- VARIANTES DE INTERFAZ Y COLORES EXTRA ---
  secundario: 'bg-marca-secundario hover:brightness-110 text-white',
  acento: 'bg-marca-acento hover:brightness-110 text-white',
  info: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  sky: 'bg-sky-500 hover:bg-sky-600 text-white',

  // --- OUTLINES Y LIGEROS ---
  outline: 'bg-white border-2 border-marca-primario text-marca-primario hover:bg-marca-primario hover:text-white transition-all duration-200',
  outline_dark: 'bg-transparent border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white',
  success_light: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
  info_light: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',

  // --- FILTROS (Nuevos, unificados para Desktop/Mobile con soporte `isActive`) ---
  // Nota: Se les agregó el prefijo 'filtro_' para evitar chocar con tus botones normales como 'gris' o 'pendiente'
  filtro_por_defecto: {
    base: "bg-white border border-slate-200/80 text-slate-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-slate-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-marca-primario to-marca-primario/90 border border-marca-primario text-white shadow-md shadow-marca-primario/25 active:scale-[0.98]"
  },
  filtro_gris: {
    base: "bg-white border border-gray-200/80 text-gray-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-800 text-white shadow-md shadow-gray-900/20 active:scale-[0.98]"
  },
  filtro_ambar: {
    base: "bg-white border border-amber-200/80 text-amber-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-amber-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]"
  },
  filtro_amarillo: {
    base: "bg-white border border-yellow-200/80 text-yellow-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-yellow-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-yellow-400 to-yellow-500 border border-yellow-500 text-white shadow-md shadow-yellow-500/25 active:scale-[0.98]"
  },
  filtro_azul: {
    base: "bg-white border border-blue-200/80 text-blue-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-blue-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]"
  },
  filtro_rosa: {
    base: "bg-white border border-rose-200/80 text-rose-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-rose-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-[0.98]"
  },
  filtro_esmeralda: {
    base: "bg-white border border-emerald-200/80 text-emerald-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-emerald-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]"
  },
  filtro_indigo: {
    base: "bg-white border border-indigo-200/80 text-indigo-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-indigo-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-[0.98]"
  },
  filtro_rojo: {
    base: "bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]"
  },
  filtro_todos: {
    base: "bg-white border border-slate-200/80 text-slate-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-slate-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-marca-primario to-marca-primario/90 border border-marca-primario text-white shadow-md shadow-marca-primario/25 active:scale-[0.98]"
  },
  filtro_pendiente: {
    base: "bg-white border border-amber-200/80 text-amber-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-amber-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]"
  },
  filtro_asignada: {
    base: "bg-white border border-blue-200/80 text-blue-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-blue-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]"
  },
  filtro_en_progreso: {
    base: "bg-white border border-violet-200/80 text-violet-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-violet-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-violet-500 to-violet-600 border border-violet-600 text-white shadow-md shadow-violet-500/25 active:scale-[0.98]"
  },
  filtro_en_pausa: {
    base: "bg-white border border-gray-200/80 text-gray-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-gray-500 to-gray-600 border border-gray-600 text-white shadow-md shadow-gray-500/25 active:scale-[0.98]"
  },
  filtro_resuelto: {
    base: "bg-white border border-emerald-200/80 text-emerald-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-emerald-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]"
  },
  filtro_cerrado: {
    base: "bg-white border border-slate-200/80 text-slate-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-slate-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-800 text-white shadow-md shadow-slate-800/25 active:scale-[0.98]"
  },
  filtro_rechazado: {
    base: "bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]"
  },
  filtro_cancelada: {
    base: "bg-white border border-gray-200/80 text-gray-500 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-gray-400 to-gray-500 border border-gray-500 text-white shadow-md shadow-gray-400/25 active:scale-[0.98]"
  },
  filtro_papelera: {
    base: "bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm",
    active: "bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]"
  }
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export const Button = ({
  children,
  variant = 'primario',
  size = 'md',
  icon,
  iconSize,
  isLoading = false,
  isActive = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  const baseClass = "rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ease-out active:scale-95 font-lectura cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:transform-none shadow-sm hover:shadow-md hover:-translate-y-0.5";

  let variantClass = variants[variant] || variants.primario;

  // <-- TE FALTÓ ESTA LÓGICA PARA EVALUAR LOS FILTROS
  if (typeof variantClass === 'object') {
    variantClass = isActive ? variantClass.active : variantClass.base;
  }

  const sizeClass = sizes[size] || sizes.md;
  const resolvedIconSize = iconSize || size;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(baseClass, variantClass, sizeClass, className)}
      {...props}
    >
      {isLoading ? (
        <Icon
          name="progress_activity"
          className="animate-spin"
          size={resolvedIconSize}
          opsz={20}
          wght={500}
        />
      ) : (
        icon && <Icon name={icon} size={resolvedIconSize} opsz={20} wght={500} />
      )}

      <span>{isLoading ? 'Cargando...' : children}</span>
    </button>
  );
};