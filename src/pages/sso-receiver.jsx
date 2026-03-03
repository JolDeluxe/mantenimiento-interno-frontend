import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export const SsoReceiver = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorLog, setErrorLog] = useState(null);
  
  // Candado para evitar que el Strict Mode de React 18 dispare el error tras limpiar la URL
  const processed = useRef(false);

  useEffect(() => {
    // Si ya procesamos el salto con éxito, ignoramos las siguientes ejecuciones
    if (processed.current) return;

    try {
      const hash = window.location.hash;
      
      if (!hash || !hash.includes('#payload=')) {
        setErrorLog('URL sin payload seguro detectada. Abortando.');
        return;
      }

      // 🔒 Bloqueamos el candado ANTES de limpiar la URL
      processed.current = true;

      const encodedPayload = hash.replace('#payload=', '');
      const decodedPayload = JSON.parse(decodeURIComponent(encodedPayload));

      if (decodedPayload.token && decodedPayload.user) {
        // Inyectar estado global
        setAuth(
          decodedPayload.user, 
          decodedPayload.token, 
          decodedPayload.refreshToken
        );
        
        // Limpiar URL silenciosamente
        window.history.replaceState(null, '', window.location.pathname);
        
        // Hard-redirect directo al Dashboard
        window.location.href = '/'; 
      } else {
        setErrorLog('El payload está incompleto (faltan llaves).');
      }
    } catch (error) {
      console.error(error);
      setErrorLog(`Error de desencriptación: ${error.message}`);
    }
  }, [setAuth]);

  if (errorLog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 shadow-sm max-w-lg font-mono text-sm">
          <strong>🛑 Falla en SSO Interceptada:</strong><br/>
          {errorLog}<br/><br/>
          <a href="/login" className="underline font-bold">Volver al Login</a>
        </div>
      </div>
    );
  }

return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Imagen con el efecto de parpadeo suave (pulse) */}
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