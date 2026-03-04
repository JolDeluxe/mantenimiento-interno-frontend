import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-4">
      <div className="text-center">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">Manufacturera de Botas Cuadra</span> © {currentYear}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Herramienta desarrollada por el equipo de <span className="font-medium">Procesos Tecnológicos</span>
        </p>
      </div>
    </footer>
  );
};