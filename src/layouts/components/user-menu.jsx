import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useAuthStore } from '@/stores/auth-store';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const menuRef = useRef(null);

  // Interceptor de estructura: 
  // Garantiza que leamos las propiedades correctamente sin importar si el store 
  // guardó el objeto { status, data } completo o solo el payload.
  const currentUser = user?.data || user;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/perfil');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-sm
          hover:bg-slate-100 transition-colors
          focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
        "
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-marca-primario">
            {currentUser?.nombre || 'Usuario'}
          </p>
          <p className="text-xs text-slate-500">
            {currentUser?.rol?.replace(/_/g, ' ') || 'Rol'}
          </p>
        </div>
        
        {/* Contenedor del Avatar con overflow-hidden obligatorio */}
        <div className="w-10 h-10 rounded-full bg-marca-secundario flex items-center justify-center overflow-hidden border border-marca-secundario/20 shrink-0 shadow-sm">
          {currentUser?.imagen && !imageFailed ? (
            <img 
              src={currentUser.imagen} 
              alt={`Avatar de ${currentUser.nombre}`} 
              className="w-full h-full object-cover animate-in fade-in duration-300"
              onError={() => setImageFailed(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Icon name="person" className="text-white" size="24px" />
          )}
        </div>

        <Icon 
          name={isOpen ? 'expand_less' : 'expand_more'} 
          className="text-slate-600 transition-transform duration-200"
          size="20px"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-56 
          bg-white rounded-sm shadow-lg border border-slate-200
          z-50 animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {/* User Info - Mobile */}
          <div className="sm:hidden px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-sm">
            <p className="text-sm font-semibold text-marca-primario">
              {currentUser?.nombre}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.email || currentUser?.username}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfile}
              className="
                w-full px-4 py-2 text-left text-sm font-medium
                hover:bg-slate-50 transition-colors
                flex items-center gap-3 text-slate-700
              "
            >
              <Icon name="account_circle" size="20px" className="text-marca-acento" />
              <span>Ver Perfil</span>
            </button>

            <button
              onClick={handleLogout}
              className="
                w-full px-4 py-2 text-left text-sm font-medium
                hover:bg-red-50 transition-colors
                flex items-center gap-3 text-red-600
              "
            >
              <Icon name="logout" size="20px" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};