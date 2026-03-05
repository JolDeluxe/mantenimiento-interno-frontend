import React from 'react';
import { cn } from '@/utils/cn';

const statusTokens = {
  'pendiente':   'bg-estado-pendiente text-white',
  'asignada':    'bg-estado-asignada text-white',
  'en-progreso': 'bg-estado-en-progreso text-white',
  'en-pausa':    'bg-estado-en-pausa text-white',
  'resuelto':    'bg-estado-resuelto text-white',
  'cerrado':     'bg-estado-cerrado text-white',
  'rechazado':   'bg-estado-rechazado text-white',
  'cancelada':   'bg-estado-cancelada text-white',
};

export const Badge = ({ children, status = 'pendiente', className, ...props }) => {
  const colorClass = statusTokens[status] || 'bg-slate-200 text-slate-800';
  
  return (
    <span 
      className={cn("px-2.5 py-1 rounded-sm text-xs font-bold shadow-sm whitespace-nowrap", colorClass, className)}
      {...props}
    >
      {children}
    </span>
  );
};