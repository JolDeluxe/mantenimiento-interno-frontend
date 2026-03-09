import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/sidebar.jsx';
import { Navbar } from './components/navbar.jsx';
import { Footer } from './components/footer.jsx';

export const DesktopLayout = () => {
  return (
    <div className="h-dvh w-full flex bg-cuadra-arena overflow-hidden">
      <div className="relative z-30 shrink-0 shadow-lg h-full">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <div className="shrink-0">
          <Navbar />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-transparent custom-scrollbar">
          <Outlet />
        </main>

        <div className="shrink-0">
          <Footer />
        </div>
      </div>
    </div>
  );
};