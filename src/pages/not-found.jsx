// src/pages/not-found.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/z_index';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="w-dvw h-dvh overflow-hidden bg-cuadra-arena flex flex-col items-center justify-between p-6 box-border">

      <header className="shrink-0 w-full flex justify-center pt-6">
        <img
          src="/img/01_Cuadra.webp"
          alt="Logotipo Cuadra"
          className="h-12 md:h-16 w-auto object-contain"
        />
      </header>

      <section className="flex-1 flex flex-col items-center justify-center min-h-0 w-full px-4">
        <h1 className="font-titulos text-9xl md:text-[12rem] lg:text-[16rem] leading-none text-slate-800 tracking-widest drop-shadow-sm select-none">
          404
        </h1>

        <img
          src="/img/404.webp"
          alt="Página no encontrada"
          className="w-full max-w-65 md:max-w-sm lg:max-w-md object-contain shrink min-h-0 mt-2 md:mt-4 pointer-events-none"
        />
      </section>

      <footer className="shrink-0 w-full flex justify-center pb-8">
        <Button
          variant="default"
          icon="home"
          onClick={() => navigate('/')}
        >
          Regresar al inicio
        </Button>
      </footer>

    </main>
  );
};

export default NotFoundPage;