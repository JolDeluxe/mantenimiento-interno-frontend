import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

export const Select = forwardRef(({ className, error, children, helperText, ...props }, ref) => {
  const baseStyles = "w-full border rounded-sm px-3 py-2 text-sm appearance-none focus:outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed bg-white";
  const stateStyles = error
    ? "border-red-500 focus:ring-2 focus:ring-red-200"
    : "border-slate-300 focus:ring-2 focus:ring-marca-secundario/30 focus:border-marca-secundario";

  return (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          className={cn(baseStyles, stateStyles, "pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <Icon name="expand_more" size="20px" />
        </div>
      </div>
      {helperText && (
        <p className={cn("text-xs mt-1", error ? "text-red-600" : "text-slate-500")}>
          {helperText}
        </p>
      )}
    </div>
  );
});
Select.displayName = 'Select';