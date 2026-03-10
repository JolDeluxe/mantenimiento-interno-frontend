import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

const variants = {
  // Color institucional (Marrón #482b2c)
  primario: 'bg-marca-primario hover:bg-marca-primario-hover text-white shadow-sm',
  
  // Mapeo a tus tokens de estado en index.css
  guardar: 'bg-estado-resuelto hover:opacity-90 text-white', // #10b981
  editar: 'bg-prioridad-media hover:opacity-90 text-white',  // #f59e0b
  accion: 'bg-estado-asignada hover:opacity-90 text-white',  // #3b82f6
  borrar: 'bg-estado-rechazado hover:opacity-90 text-white', // #ef4444
  
  // Neutros
  cancelar: 'bg-slate-300 hover:bg-slate-400 text-slate-700',
  ghost: 'bg-transparent border border-slate-300 text-slate-600 hover:bg-slate-50'
};

export const Button = ({
  children,
  variant = 'primario',
  icon,
  isLoading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) => {
  // Usamos el radio-cuadra (0.25rem) y la fuente-lectura (Lato) de tus tokens
  const baseClass = "px-5 py-2 rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 font-lectura cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale disabled:transform-none";  
  const variantClass = variants[variant] || variants.primario;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(baseClass, variantClass, className)}
      {...props}
    >
      {isLoading ? (
        <Icon 
          name="progress_activity" 
          className="animate-spin text-lg" 
          opsz={20} 
          wght={500}
        />
      ) : (
        icon && <Icon name={icon} className="text-lg" opsz={20} wght={500} />
      )}
      
      <span>{isLoading ? 'Cargando...' : children}</span>
    </button>
  );
};