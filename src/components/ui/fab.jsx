import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

export const Fab = ({
  icon,
  onClick,
  disabled = false,
  isLoading = false,
  variant = "solid",
  positionClass = "bottom-6 right-5",
  className
}) => {

  const variants = {
    "solid": "bg-marca-primario text-white shadow-xl hover:brightness-110",

    "glass-blue": "bg-estado-asignada/60 backdrop-blur-md border border-white/40 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] hover:bg-estado-asignada/80",

    "glass-primary": "bg-marca-primario/70 backdrop-blur-md border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:bg-marca-primario/90",

    "glass-green": "bg-estado-resuelto/70 backdrop-blur-md border border-white/30 text-white shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] hover:bg-estado-resuelto/90",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "fixed z-50 flex items-center justify-center rounded-full",
        "w-14 h-14",
        "transition-all duration-300 ease-out active:scale-95 cursor-pointer",
        "hover:-translate-y-1",
        variants[variant] || variants.solid,
        (disabled || isLoading) && "opacity-60 cursor-wait active:scale-100 hover:transform-none hover:shadow-xl",
        positionClass,
        className
      )}
    >
      <Icon
        name={isLoading ? "progress_activity" : icon}
        className={cn("text-3xl drop-shadow-md", isLoading && "animate-spin")}
      />
    </button>
  );
};