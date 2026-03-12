import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './icon';

export const Fab = ({ 
  icon = 'refresh', 
  onClick, 
  isLoading = false, 
  disabled = false, 
  className,
  ...props 
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "p-3 rounded-full shadow-xl transition-all duration-300 z-50 fixed",
        "bg-marca-secundario text-white hover:bg-marca-primario", 
        "bottom-20 right-6 lg:bottom-10 lg:right-10",
        !isDisabled && "active:scale-90 cursor-pointer",
        isDisabled && "opacity-75 cursor-wait",
        className
      )}
      {...props}
    >
      <Icon 
        name={icon} 
        size="32px" 
        className={isLoading ? "animate-spin" : ""} 
      />
    </button>
  );
};