import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

/**
 * 1. CONTENEDOR PRINCIPAL (Física, Blur, Clics y Teclado)
 * Uso: Mantiene la lógica de apertura/cierre.
 */
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
      // Bloquear scroll del body al abrir el modal
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          mouseDownInside.current = false;
        }
      }}
      onMouseUp={(e) => {
        if (!mouseDownInside.current && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-2xl relative flex flex-col max-h-[90vh] w-[95%] max-w-2xl animate-in zoom-in-95 duration-200",
          className
        )}
        onMouseDown={() => {
          mouseDownInside.current = true;
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 2. CABECERA (Opcional)
 * Uso: Formularios o vistas con título.
 */
export const ModalHeader = ({ title, onClose, className = "" }) => {
  return (
    <div className={cn("shrink-0 p-6 pb-4 border-b border-slate-200 relative", className)}>
      <h2 className="text-lg font-bold text-marca-primario text-center uppercase tracking-wide">
        {title}
      </h2>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * 3. CUERPO SCROLLABLE (Requerido)
 * Uso: Donde va el contenido, formularios, texto, etc. Evita que el modal crezca más que la pantalla.
 */
export const ModalBody = ({ children, className = "" }) => {
  return (
    <div className={cn("grow overflow-y-auto p-6", className)}>
      {children}
    </div>
  );
};

/**
 * 4. PIE FIJO (Opcional)
 * Uso: Para mantener botones de "Guardar" o "Cancelar" siempre visibles.
 */
export const ModalFooter = ({ children, className = "" }) => {
  return (
    <div className={cn("shrink-0 flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-200 rounded-b-lg", className)}>
      {children}
    </div>
  );
};