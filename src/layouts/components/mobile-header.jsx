import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/icon'; 
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export const MobileHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const profileRef = useRef(null);

  const currentUser = user?.data || user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigateProfile = () => {
    navigate('/perfil');
    setProfileOpen(false);
  };

  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const imageUrl = resolveImageUrl(currentUser?.imagen);

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 relative">
      <div className="flex items-center justify-between">
        
        {/* IZQUIERDA: Perfil (Wireframe 3 Trigger) */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-marca-secundario flex items-center justify-center overflow-hidden border-2 border-transparent focus:border-marca-primario transition-all shadow-sm"
          >
            {imageUrl && !imageFailed ? (
              <img 
                src={imageUrl} 
                alt="Perfil" 
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <Icon name="person" className="text-white" size="24px" />
            )}
          </button>

          {/* Popover de Perfil */}
          {profileOpen && (
            <div className="absolute left-0 mt-3 w-64 bg-white rounded-sm shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-base font-semibold text-marca-primario leading-tight">
                  {currentUser?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {currentUser?.email}
                </p>
                <p className="inline-block mt-2 px-2 py-0.5 bg-marca-primario/10 text-marca-primario text-[10px] font-bold uppercase tracking-wider rounded-sm">
                  {currentUser?.rol?.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="py-2">
                <button
                  onClick={handleNavigateProfile}
                  className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 flex items-center gap-3 text-slate-700"
                >
                  <Icon name="account_circle" size="20px" className="text-marca-acento" />
                  <span>Ver Perfil Completo</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-red-50 flex items-center gap-3 text-red-600"
                >
                  <Icon name="logout" size="20px" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CENTRO: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img 
            src="/img/01_Cuadra_Mantnimento.webp" 
            alt="Cuadra Mantenimiento" 
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* DERECHA: Menú Hamburguesa (Wireframe 1 Trigger) */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 -mr-2 rounded-md hover:bg-slate-100 transition-colors text-marca-primario"
          aria-label="Menú de navegación"
        >
          <Icon name="menu" size="28px" />
        </button>

      </div>
    </header>
  );
};