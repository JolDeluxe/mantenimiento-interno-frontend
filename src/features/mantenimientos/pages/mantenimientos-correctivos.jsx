// src/features/mantenimientos/pages/mantenimientos-correctivos.jsx
import React from 'react';
import MantenimientosHistoricoPage from './mantenimientos-historico';
import { MantenimientosCorrectivosDesktop } from '../views/mantenimientos-correctivos-desktop';
import { MantenimientosCorrectivosMobile } from '../views/mantenimientos-correctivos-mobile';

export default function MantenimientosCorrectivosPage() {
    return <MantenimientosHistoricoPage forcedClasificacion="CORRECTIVO" DesktopView={MantenimientosCorrectivosDesktop} MobileView={MantenimientosCorrectivosMobile} />;
}
