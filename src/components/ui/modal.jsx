import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from './z_index';

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = "" 
}) => {
  const mouseDownInside = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Renderizamos mediante Portal para asegurar que el Z-INDEX sea absoluto
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) mouseDownInside.current = false;
      }}
      onMouseUp={(e) => {
        if (!mouseDownInside.current && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-2xl relative flex flex-col max-h-[90vh] w-full max-w-2xl animate-in zoom-in-95 duration-200",
          className
        )}
        onMouseDown={() => { mouseDownInside.current = true; }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ title, onClose, className = "" }) => (
  <div className={cn("shrink-0 p-6 pb-4 border-b border-slate-100 relative", className)}>
    <h2 className="text-lg font-bold text-marca-primario text-center uppercase tracking-wider fuente-titulos">
      {title}
    </h2>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-marca-primario transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-100"
      >
        <Icon name="close" size="24px" weight={600} />
      </button>
    )}
  </div>
);

export const ModalBody = ({ children, className = "" }) => (
  <div className={cn("grow overflow-y-auto p-6 font-lectura", className)}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = "" }) => (
  <div className={cn("shrink-0 flex justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50 rounded-b-lg", className)}>
    {children}
  </div>
);