import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

const variants = {
  guardar: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  editar: 'bg-amber-500 hover:bg-amber-600 text-white',
  accion: 'bg-blue-600 hover:bg-blue-700 text-white',
  borrar: 'bg-red-600 hover:bg-red-700 text-white',
  cancelar: 'bg-slate-300 hover:bg-slate-400 text-slate-700',
};

export const Button = ({
  children,
  variant = 'accion',
  icon,
  isLoading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  const baseClass = "px-5 py-2 rounded-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:transform-none";
  const variantClass = variants[variant] || variants.accion;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(baseClass, variantClass, className)}
      {...props}
    >
      {isLoading && <Icon name="progress_activity" className="animate-spin text-lg" />}
      {!isLoading && icon && <Icon name={icon} className="text-lg" />}
      <span>{children}</span>
    </button>
  );
};