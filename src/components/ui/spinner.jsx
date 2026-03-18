import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

/**
 * Esqueleto adaptable para simular carga de bloques de texto, inputs o imágenes.
 * Uso: <Skeleton className="h-10 w-full" />
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse bg-slate-300 rounded-sm", className)}
      {...props}
    />
  );
};

/**
 * Spinner tradicional circular.
 * Uso: <Spinner size="32px" />
 */
export const Spinner = ({ className, size = "24px" }) => {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <Icon
        name="progress_activity"
        size={size}
        className="animate-spin text-marca-primario"
      />
    </div>
  );
};