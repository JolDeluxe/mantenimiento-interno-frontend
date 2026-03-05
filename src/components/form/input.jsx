import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(({ className, error, multiline, helperText, ...props }, ref) => {
  const baseStyles = "w-full border rounded-sm px-3 py-2 text-sm focus:outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed bg-white";
  const stateStyles = error
    ? "border-red-500 focus:ring-2 focus:ring-red-200"
    : "border-slate-300 focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario";

  const Component = multiline ? "textarea" : "input";

  return (
    <div className="w-full">
      <Component
        ref={ref}
        className={cn(baseStyles, stateStyles, multiline && "resize-none h-24", className)}
        {...props}
      />
      {helperText && (
        <p className={cn("text-xs mt-1", error ? "text-red-600" : "text-slate-500")}>
          {helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';