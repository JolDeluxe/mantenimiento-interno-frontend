// src/components/layouts/user-menu.jsx
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

  const currentUser = user?.data || user;

  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const imageUrl = resolveImageUrl(currentUser?.imagen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          cursor-pointer
          flex items-center gap-2 px-3 py-2 rounded-sm
          hover:bg-slate-100 transition-colors
          focus:outline-none focus:ring-2 focus:ring-marca-secundario/30
        "
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-marca-primario">
            {currentUser?.nombre || 'Usuario'}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {currentUser?.rol?.replace(/_/g, ' ').toLowerCase() || 'Rol'}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-marca-secundario flex items-center justify-center overflow-hidden border border-marca-secundario/20 shrink-0 shadow-sm">
          {imageUrl && !imageFailed ? (
            <img 
              src={imageUrl} 
              alt={`Avatar de ${currentUser?.nombre}`} 
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

      {isOpen && (
        <div className="
          absolute right-0 mt-2 w-56 
          bg-white rounded-sm shadow-lg border border-slate-200
          z-50 animate-in fade-in slide-in-from-top-2 duration-200
        ">
          <div className="sm:hidden px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-sm">
            <p className="text-sm font-semibold text-marca-primario">
              {currentUser?.nombre}
            </p>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {currentUser?.email || currentUser?.username}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfile}
              className="
                cursor-pointer
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
                cursor-pointer
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