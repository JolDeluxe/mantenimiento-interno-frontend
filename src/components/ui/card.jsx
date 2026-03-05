import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("p-6 border-b border-slate-200", className)} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);