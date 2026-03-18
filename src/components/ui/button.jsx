import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

const variants = {
  // Color institucional
  primario: 'bg-marca-primario hover:bg-marca-primario-hover text-white',

  // Mapeo a tus tokens de estado. Usamos brightness-110 para que el color "brille" al hover
  guardar: 'bg-estado-resuelto hover:brightness-110 text-white',
  editar: 'bg-prioridad-media hover:brightness-110 text-white',
  accion: 'bg-estado-asignada hover:brightness-110 text-white',
  borrar: 'bg-estado-rechazado hover:brightness-110 text-white',

  // Neutros
  cancelar: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
  ghost: 'bg-transparent border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900'
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

const iconSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export const Button = ({
  children,
  variant = 'primario',
  size = 'sm', // Tu default actual
  icon,
  isLoading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  // 🔥 MEJORA: Agregamos shadow-sm base, y en hover shadow-md con elevación (-translate-y-0.5)
  const baseClass = "rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-out active:scale-95 font-lectura cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:transform-none shadow-sm hover:shadow-md hover:-translate-y-0.5";

  const variantClass = variants[variant] || variants.primario;
  const sizeClass = sizes[size] || sizes.md;
  const iconClass = iconSizes[size] || iconSizes.md;

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
          className={cn("animate-spin", iconClass)}
          opsz={20}
          wght={500}
        />
      ) : (
        icon && <Icon name={icon} className={iconClass} opsz={20} wght={500} />
      )}

      <span>{isLoading ? 'Cargando...' : children}</span>
    </button>
  );
};