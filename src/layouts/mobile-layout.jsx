import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileSidebar } from './components/mobile-sidebar.jsx';

export const MobileLayout = () => {
  return (
    <div className="h-dvh w-full flex flex-col bg-cuadra-arena overflow-hidden">
      <div className="shrink-0 relative z-30 shadow-sm">
        <MobileHeader />
      </div>
      
      <MobileSidebar />

      <main className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar relative z-10">
        <Outlet />
      </main>
    </div>
  );
};