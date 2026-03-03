// src/pages/home-dashboard.jsx
// Cascarón temporal para que el enrutador tenga a dónde enviarte tras un login exitoso
import React from 'react';
import { useAuthStore } from '@/stores/auth-store';

const HomeDashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuadra-arena/10">
      <div className="flex justify-center mb-8">
          <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-70 h-auto object-contain" />
        </div>
      <h1 className="fuente-titulos text-4xl text-marca-primario mb-4">
        Dashboard Principal
      </h1>
      <p className="text-slate-600 mb-8">Has iniciado sesión correctamente.</p>
      
      <button 
        onClick={logout}
        className="px-6 py-2 bg-marca-acento text-white font-bold rounded shadow hover:bg-opacity-90 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default HomeDashboard;