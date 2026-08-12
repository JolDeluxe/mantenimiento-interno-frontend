import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import api, { isTemporaryAuthError } from '@/lib/axios';

const SSO_RECOVERY_KEY = 'cuadra:sso-recovery-failed';

export const SsoReceiver = () => {
  const [errorLog, setErrorLog] = useState(null);
  const [temporaryError, setTemporaryError] = useState(false);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    api.post('/api/auth/refresh', {}, { _skipAuthRedirect: true })
      .then((payload) => {
        if (!payload?.user) {
          throw new Error('No se pudo reanudar la sesión.');
        }

        sessionStorage.removeItem(SSO_RECOVERY_KEY);
        useAuthStore.getState().setAuth(payload.user);
        window.history.replaceState(null, '', window.location.pathname);
        window.location.href = '/';
      })
      .catch((error) => {
        const temporary = isTemporaryAuthError(error);
        setTemporaryError(temporary);
        if (!temporary) {
          sessionStorage.setItem(SSO_RECOVERY_KEY, '1');
          useAuthStore.getState().resetAuthOnly();
          window.location.replace('/login');
          return;
        }

        setErrorLog(temporary
          ? 'No se pudo verificar la sesión porque el servidor no está disponible. Intenta recargar en unos momentos.'
          : (error.response?.data?.message || error.message || 'Sesión no disponible.'));
      });
  }, []);

  if (errorLog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 shadow-sm max-w-lg font-mono text-sm">
          <strong>Falla en SSO:</strong><br />
          {errorLog}
          {!temporaryError && (
            <>
              <br /><br />
              <a href="/login" className="underline font-bold">Volver al Login</a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-6">
        <img
          src="/img/01_Cuadra.webp"
          alt="Logo Cuadra"
          className="w-48 h-auto object-contain animate-pulse drop-shadow-md"
        />
      </div>
    </div>
  );
};

export default SsoReceiver;
