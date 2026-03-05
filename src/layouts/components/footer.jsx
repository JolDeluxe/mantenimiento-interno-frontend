import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-4">
      <div className="text-center">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">Manufacturera de Botas Cuadra</span> © {currentYear}
        </p>
      </div>
    </footer>
  );
};