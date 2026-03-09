import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ children, className, ...props }) => (
  <div 
    className={cn("bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden", className)} 
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("px-4 py-3 border-b border-slate-100 bg-slate-50/50", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-lg font-bold text-slate-800 fuente-titulos uppercase tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardBody = ({ children, className, ...props }) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn("px-4 py-3 border-t border-slate-100 bg-slate-50/30", className)} {...props}>
    {children}
  </div>
);