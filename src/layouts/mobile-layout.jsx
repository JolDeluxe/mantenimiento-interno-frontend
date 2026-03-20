import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileSidebar } from './components/mobile-sidebar.jsx';

export const MobileLayout = () => {
  return (
    <div className="h-dvh w-full flex flex-col bg-cuadra-arena overflow-hidden relative">

      {/* LIQUID GLASS HEADER 
        Alineamos la refracción del header a la misma matemática del Sidebar.
        Usamos cuadra-arena/70 para mantener cohesión de color.
      */}
      <div className="shrink-0 z-30 bg-cuadra-arena/70 backdrop-blur-2xl saturate-[150%] border-b border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] relative">
        <MobileHeader />
      </div>

      <MobileSidebar />

      {/* MAIN CONTENT
        El scroll subyacente ahora se difuminará de manera hermosa 
        cuando pase por debajo del Header gracias al blur-2xl superior.
      */}
      <main className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar relative z-10">
        <Outlet />
      </main>

    </div>
  );
};