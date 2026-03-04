import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export const Tooltip = ({ 
  children, 
  text, 
  position = 'top', 
  offset = 8,
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    const positions = {
      top: {
        top: rect.top - offset,
        left: rect.left + (rect.width / 2),
      },
      bottom: {
        top: rect.bottom + offset,
        left: rect.left + (rect.width / 2),
      },
      left: {
        top: rect.top + (rect.height / 2),
        left: rect.left - offset,
      },
      right: {
        top: rect.top + (rect.height / 2),
        left: rect.right + offset,
      }
    };

    setCoords(positions[position]);
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    calculatePosition();
    setIsVisible(true);
    if (children.props.onMouseEnter) children.props.onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsVisible(false);
    if (children.props.onMouseLeave) children.props.onMouseLeave(e);
  };

  const handleClick = (e) => {
    setIsVisible(false); // Ocultar al hacer clic (útil en botones o links)
    if (children.props.onClick) children.props.onClick(e);
  };

  // Clases dinámicas según la posición
  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-y-1/2 -translate-x-full',
    right: '-translate-y-1/2'
  };

  const arrowClasses = {
    top: 'absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-marca-primario',
    bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-marca-primario',
    left: 'absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-marca-primario',
    right: 'absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-marca-primario'
  };

  return (
    <>
      {/* Inyección silenciosa de ref y eventos al hijo */}
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handleClick,
      })}

      {/* Renderizado del Portal */}
      {isVisible && !disabled && createPortal(
        <div 
          className={`
            fixed bg-marca-primario text-white px-2.5 py-1 rounded-sm
            whitespace-nowrap text-xs font-semibold shadow-lg
            pointer-events-none z-[100]
            animate-in fade-in zoom-in-95 duration-200
            ${positionClasses[position]}
          `}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
          <div className={arrowClasses[position]} />
        </div>,
        document.body
      )}
    </>
  );
};