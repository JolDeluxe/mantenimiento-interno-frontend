import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { glassBase, GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

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
    <header className="bg-transparent px-4 py-3 relative">
      <div className="flex items-center justify-between">

        {/* IZQUIERDA: Perfil */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-marca-secundario flex items-center justify-center overflow-hidden border-2 border-transparent focus:border-white/50 transition-all shadow-sm active:scale-95 outline-none"
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

          {/* Popover de Perfil — Liquid Glass Inmersivo y Alta Legibilidad */}
          {profileOpen && (
            <div
              className="absolute left-0 mt-3 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col p-1.5"
              style={{
                ...glassBase('primary'),
                background: 'rgba(72, 43, 44, 0.98)', // Override: Casi sólido para bloquear el fondo
                boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.4) inset', // Sombra masiva para despegarlo
                borderRadius: '20px'
              }}
            >
              {/* Brillo especular mantenido para estética cristalina */}
              <GlassSheen />

              <div className="relative z-10 px-4 py-4 border-b border-white/15">
                <p className="text-[15px] font-bold text-white leading-tight drop-shadow-sm">
                  {currentUser?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-white/70 mt-1 truncate font-medium">
                  {currentUser?.email}
                </p>
                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 bg-white/10 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-md backdrop-blur-md border border-white/20 shadow-inner">
                    {currentUser?.rol?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="relative z-10 py-1.5 flex flex-col gap-1">
                <button
                  onClick={handleNavigateProfile}
                  className="w-full px-3 py-3 text-left text-sm font-bold hover:bg-white/10 active:bg-white/20 transition-all flex items-center gap-3 text-white/95 rounded-xl outline-none"
                >
                  <Icon name="account_circle" size="20px" className="text-white drop-shadow-sm" />
                  <span>Ver Perfil Completo</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-3 text-left text-sm font-bold hover:bg-red-500/30 active:bg-red-500/50 transition-all flex items-center gap-3 text-red-100 rounded-xl outline-none"
                >
                  <Icon name="logout" size="20px" className="text-red-300 drop-shadow-sm" />
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
            className="h-8 w-auto object-contain drop-shadow-sm"
          />
        </div>

        {/* DERECHA: Menú Hamburguesa */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 -mr-2 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-marca-primario outline-none border border-transparent hover:border-white/30"
          aria-label="Menú de navegación"
        >
          <Icon name="menu" size="28px" />
        </button>

      </div>
    </header>
  );
};