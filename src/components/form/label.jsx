import React from 'react';
import { cn } from '@/utils/cn';

export const Label = ({ children, className, error, hint, ...props }) => {
  return (
    <div className="flex justify-between items-end mb-1">
      <label className={cn("block text-sm font-bold", error ? "text-red-600" : "text-slate-700", className)} {...props}>
        {children}
      </label>
      {/* Hint se usa para el contador de caracteres ej. "15/50" */}
      {hint && (
        <span className={cn("text-xs", error ? "text-red-600 font-bold" : "text-slate-500")}>
          {hint}
        </span>
      )}
    </div>
  );
};