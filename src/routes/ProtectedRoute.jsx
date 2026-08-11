import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import api, { isSessionInvalidError, isTemporaryAuthError } from '@/lib/axios';

export const ProtectedRoute = () => {
  const { isAuthenticated, user, authStatus, setAuthChecking, setAuthTemporarilyUnavailable, setUnauthenticated } = useAuthStore();
  const currentUser = user?.data || user;
  let urlDestino = import.meta.env.VITE_URL_PORTAL_CLIENTE || 'http://localhost:5001';
  if (urlDestino.endsWith('/')) urlDestino = urlDestino.slice(0, -1);
  const loopDetected = currentUser?.rol === 'CLIENTE_INTERNO' && urlDestino === window.location.origin
    ? `VITE_URL_PORTAL_CLIENTE es idéntica al origen (${urlDestino}). Revisa tu archivo .env.`
    : '';

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) setAuthChecking();

    const sessionCheck = isAuthenticated
      ? api.get('/api/auth/me')
      : api.post('/api/auth/refresh', {});

    sessionCheck
      .then((payload) => {
        if (!active) return;
        const verifiedUser = payload?.user || payload?.data || payload;
        if (verifiedUser) useAuthStore.getState().setAuth(verifiedUser);
      })
      .catch((error) => {
        if (!active) return;
        if (isTemporaryAuthError(error)) {
          setAuthTemporarilyUnavailable();
        } else if (isSessionInvalidError(error)) {
          setUnauthenticated();
        } else {
          setAuthTemporarilyUnavailable();
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, setAuthChecking, setAuthTemporarilyUnavailable, setUnauthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.rol === 'CLIENTE_INTERNO') {
      if (urlDestino === window.location.origin) {
        return;
      }

      window.location.replace(`${urlDestino}/sso-receiver#resume=1`);
    }
  }, [isAuthenticated, currentUser, urlDestino]);

  if (loopDetected) {
    return <div className="p-10 text-red-600 font-mono font-bold text-center">🛑 BUCLE INFINITO PREVENIDO: {loopDetected}</div>;
  }

  if (!isAuthenticated && authStatus === 'CHECKING') {
    return null;
  }

  if (!isAuthenticated && authStatus === 'TEMPORARILY_UNAVAILABLE') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-sm font-semibold text-slate-600">
        No se pudo verificar tu sesión porque el servidor no está disponible. Intenta recargar en unos momentos.
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (currentUser?.rol === 'CLIENTE_INTERNO') {
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
