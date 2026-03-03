import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/axios';

const HomeDashboard = () => {
  const logout = useAuthStore((state) => state.logout);
  
  // 1. Estados locales para guardar la data o el error y mostrarlos en pantalla
  const [backendData, setBackendData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const probarConexionProtegida = async () => {
    try {
      // Limpiamos errores previos antes de llamar
      setErrorMsg(null); 
      setBackendData(null);

      const response = await api.get('/api/auth/me');
      console.log('✅ Éxito - Datos del Backend:', response);
      
      // 2. Guardamos la respuesta en el estado
      setBackendData(response); 
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      // 3. Guardamos el error en el estado
      setErrorMsg(error.message || "Error al conectar con el backend");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuadra-arena/10 p-4">
      <div className="flex justify-center mb-8">
        <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-70 h-auto object-contain" />
      </div>
      
      <h1 className="fuente-titulos text-4xl text-marca-primario mb-4 text-center">
        Dashboard Principal
      </h1>
      
      <p className="text-slate-600 mb-8 text-center">
        Has iniciado sesión correctamente.<br/>
        <span className="text-sm">Presiona el botón para imprimir la respuesta en pantalla.</span>
      </p>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={probarConexionProtegida}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition-colors"
        >
          Llamar a /api/auth/me
        </button>

        <button 
          onClick={logout}
          className="px-6 py-2 bg-marca-acento text-white font-bold rounded shadow hover:bg-opacity-90 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* 4. Bloque UI: Muestra los datos en formato JSON formateado si la petición fue exitosa */}
      {backendData && (
        <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md overflow-hidden">
          <h2 className="text-lg font-bold text-marca-primario mb-2">Respuesta de /api/auth/me:</h2>
          <pre className="bg-slate-50 p-4 rounded text-sm text-slate-700 overflow-x-auto whitespace-pre-wrap border border-slate-200">
            {JSON.stringify(backendData, null, 2)}
          </pre>
        </div>
      )}

      {/* 5. Bloque UI: Muestra el error si la petición falló */}
      {errorMsg && (
        <div className="w-full max-w-2xl bg-red-50 p-6 rounded-lg shadow-md border border-red-200">
          <h2 className="text-lg font-bold text-red-800 mb-2">Error de petición:</h2>
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

    </div>
  );
};

export default HomeDashboard;