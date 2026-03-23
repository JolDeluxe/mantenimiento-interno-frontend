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
  soft: 'bg-slate-50 hover:bg-white text-slate-400 border border-transparent hover:border-slate-200', // Casi blanco

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
  info_light: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
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
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  const baseClass = "rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out active:scale-95 font-lectura cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:transform-none shadow-sm hover:shadow-md hover:-translate-y-0.5";

  const variantClass = variants[variant] || variants.primario;
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