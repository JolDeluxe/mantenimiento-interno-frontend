// frontend/src/components/ui/tooltip.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

const VARIANTS = {
  default: 'bg-marca-primario text-white',
  dark: 'bg-slate-800 text-white',
  error: 'bg-estado-rechazado text-white',
  success: 'bg-estado-resuelto text-white',
};

const getArrowClasses = (variant, position) => {
  const base = 'absolute border-[5px] border-transparent';

  const colors = {
    default: {
      top: 'border-t-marca-primario', bottom: 'border-b-marca-primario',
      left: 'border-l-marca-primario', right: 'border-r-marca-primario'
    },
    dark: {
      top: 'border-t-slate-800', bottom: 'border-b-slate-800',
      left: 'border-l-slate-800', right: 'border-r-slate-800'
    },
    error: {
      top: 'border-t-estado-rechazado', bottom: 'border-b-estado-rechazado',
      left: 'border-l-estado-rechazado', right: 'border-r-estado-rechazado'
    },
    success: {
      top: 'border-t-estado-resuelto', bottom: 'border-b-estado-resuelto',
      left: 'border-l-estado-resuelto', right: 'border-r-estado-resuelto'
    }
  };

  const positions = {
    top: 'top-full left-1/2 -translate-x-1/2',
    bottom: 'bottom-full left-1/2 -translate-x-1/2',
    left: 'left-full top-1/2 -translate-y-1/2',
    right: 'right-full top-1/2 -translate-y-1/2'
  };

  return `${base} ${positions[position]} ${colors[variant]?.[position] || colors.default[position]}`;
};

export const Tooltip = ({
  children,
  text,
  position = 'top',
  variant = 'default',
  offset = 8,
  delay = 200,
  className,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const positions = {
      top: { top: rect.top - offset, left: rect.left + (rect.width / 2) },
      bottom: { top: rect.bottom + offset, left: rect.left + (rect.width / 2) },
      left: { top: rect.top + (rect.height / 2), left: rect.left - offset },
      right: { top: rect.top + (rect.height / 2), left: rect.right + offset }
    };

    setCoords(positions[position]);
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    calculatePosition();
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    if (children.props.onMouseEnter) children.props.onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    if (children.props.onMouseLeave) children.props.onMouseLeave(e);
  };

  const handleClick = (e) => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
    if (children.props.onClick) children.props.onClick(e);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-y-1/2 -translate-x-full',
    right: '-translate-y-1/2'
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleClick,
      })}

      {isVisible && !disabled && createPortal(
        <div
          className={cn(
            "fixed px-2.5 py-1 rounded-sm whitespace-nowrap text-xs font-semibold shadow-lg pointer-events-none z-[100]",
            "animate-in fade-in zoom-in-95 duration-200",
            positionClasses[position],
            VARIANTS[variant],
            className
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
          <div className={getArrowClasses(variant, position)} />
        </div>,
        document.body
      )}
    </>
  );
};