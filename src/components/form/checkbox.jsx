import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Checkbox = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer text-sm select-none w-fit", className)}>
      <input
        type="checkbox"
        ref={ref}
        className="w-4 h-4 rounded-sm border-slate-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-marca-primario"
        {...props}
      />
      {label && (
        <span className={cn("font-medium", error ? "text-red-600" : "text-slate-700")}>
          {label}
        </span>
      )}
    </label>
  );
});
Checkbox.displayName = 'Checkbox';