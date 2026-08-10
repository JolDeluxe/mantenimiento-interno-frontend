import React from 'react';
import MaquinariaBIDesktop from '../views/maquinaria-bi-desktop';
import MaquinariaBIMobile from '../views/maquinaria-bi-mobile';

export function MaquinariaBIView({ bi, agrupacion, mobile = false }) {
  return mobile ? (
    <MaquinariaBIMobile bi={bi} agrupacion={agrupacion} />
  ) : (
    <MaquinariaBIDesktop bi={bi} agrupacion={agrupacion} />
  );
}
