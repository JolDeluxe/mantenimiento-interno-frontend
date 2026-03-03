import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export const ProtectedRoute = () => {
  const { isAuthenticated, user, token, refreshToken } = useAuthStore();
  const [loopDetected, setLoopDetected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.rol === 'CLIENTE_INTERNO') {
      let urlDestino = import.meta.env.VITE_URL_PORTAL_CLIENTE || 'http://localhost:5001';
      if (urlDestino.endsWith('/')) urlDestino = urlDestino.slice(0, -1); 

      if (urlDestino === window.location.origin) {
        setLoopDetected(`VITE_URL_PORTAL_CLIENTE es idéntica al origen (${urlDestino}). Revisa tu archivo .env.`);
        return;
      }

      const payload = encodeURIComponent(JSON.stringify({ user, token, refreshToken }));

      // Destruir la sesión zombie en este portal antes de saltar
      useAuthStore.getState().logout();

      window.location.replace(`${urlDestino}/sso-receiver#payload=${payload}`);
    }
  }, [isAuthenticated, user, token, refreshToken]);

  if (loopDetected) {
    return <div className="p-10 text-red-600 font-mono font-bold text-center">🛑 BUCLE INFINITO PREVENIDO: {loopDetected}</div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.rol === 'CLIENTE_INTERNO') {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 space-y-6">
          <img 
            src="/img/01_Cuadra.webp" 
            alt="Logo Cuadra" 
            className="w-48 h-auto object-contain animate-pulse drop-shadow-md" 
          />
          <p className="text-sm font-semibold text-gray-600 tracking-wide animate-pulse">
            Saltando a portal correspondiente...
          </p>
        </div>
      );
  }

  return <Outlet />;
};