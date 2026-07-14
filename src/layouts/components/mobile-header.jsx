import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/icon';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { useNotifyStore } from '@/stores/notify-store';
import { NotifyBadge } from '@/features/notificaciones/components/notify-badge';

// Recibe la prop showBurger para decidir si renderiza el botón del menú lateral
export const MobileHeader = ({ showBurger = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleMobileMenu, badgeCounts } = useUIStore();
  const { noLeidas } = useNotifyStore();

  const totalBurgerCount = (badgeCounts?.bandeja || 0) + (badgeCounts?.aprobar || 0);

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

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleNavigateProfile = () => { navigate('/perfil'); setProfileOpen(false); };

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

        {/* IZQUIERDA: Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-marca-secundario flex items-center justify-center overflow-hidden border-2 border-transparent focus:border-white/50 transition-all shadow-sm active:scale-95 outline-none"
          >
            {imageUrl && !imageFailed ? (
              <img src={imageUrl} alt="Perfil" className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
            ) : (
              <Icon name="person" className="text-white" size="24px" />
            )}
          </button>

          {profileOpen && (
  <div
    className="absolute left-0 mt-3 w-64 z-50 animate-in fade-in slide-in-from-top-2 duration-300 flex flex-col overflow-hidden"
    style={{
      // Base sólida pero ultra transparente
      background: 'linear-gradient(135deg, rgba(72, 43, 44, 0.85), rgba(45, 25, 26, 0.95))',
      backdropFilter: 'blur(20px) saturate(180%)', // El blur es clave
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.15)', // Borde de cristal fino
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
      borderRadius: '24px' // Más redondeado se siente más orgánico
    }}
  >
    <GlassSheen /> {/* Mantenemos tu efecto de brillo superior */}
    
    <div className="relative z-10 px-5 py-5 border-b border-white/10">
      <p className="text-[15px] font-bold text-white leading-tight drop-shadow-md">{currentUser?.nombre || 'Usuario'}</p>
      <p className="text-xs text-white/60 mt-1 truncate font-medium tracking-wide">{currentUser?.email}</p>
      <div className="mt-4">
        <span className="inline-block px-3 py-1 bg-white/5 text-white/90 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/10 shadow-sm backdrop-blur-sm">
          {currentUser?.rol?.replace(/_/g, ' ')}
        </span>
      </div>
    </div>

    <div className="relative z-10 p-2 flex flex-col gap-1">
      <button 
        onClick={handleNavigateProfile} 
        className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-white/10 active:bg-white/20 transition-all flex items-center gap-3 text-white/90 rounded-xl outline-none group"
      >
        <Icon name="account_circle" size="20px" className="text-white/80 group-hover:text-white transition-colors" />
        <span>Ver Perfil</span>
      </button>
      
      <button 
        onClick={handleLogout} 
        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-red-500/20 active:bg-red-500/30 transition-all flex items-center gap-3 text-red-100/90 rounded-xl outline-none group"
      >
        <Icon name="logout" size="20px" className="text-red-300/80 group-hover:text-red-200 transition-colors" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </div>
)}
        </div>

        {/* CENTRO: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src="/img/01_Cuadra_Mantnimento.webp" alt="Cuadra Mantenimiento" className="h-8 w-auto object-contain drop-shadow-sm" />
        </div>

        {/* DERECHA: Campana + Menú Condicional */}
        <div className="flex items-center gap-4">
          {/* Campana móvil */}
          <button
            onClick={() => navigate(`/notificaciones?refresh=${Date.now()}`)}
            className="relative w-10 h-10 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-marca-primario flex items-center justify-center outline-none"
            aria-label="Notificaciones"
          >
            <Icon name="notifications" size="22px" />
            <NotifyBadge count={noLeidas} className="-top-1 -right-1 border-white" />
          </button>

          {/* Hamburguesa (Condicional al número de módulos) */}
          {showBurger && (
            <button
              onClick={toggleMobileMenu}
              className="relative w-10 h-10 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-marca-primario flex items-center justify-center outline-none border border-transparent hover:border-white/30"
              aria-label="Menú de navegación"
            >
              <Icon name="menu" size="26px" />
              <NotifyBadge count={totalBurgerCount} className="-top-1 -right-1 border-white" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
