// src/features/mantenimientos/pages/mantenimientos-preventivos.jsx
import React from 'react';
import MantenimientosHistoricoPage from './mantenimientos-historico';
import { MantenimientosPreventivosDesktop } from '../views/mantenimientos-preventivos-desktop';
import { MantenimientosPreventivosMobile } from '../views/mantenimientos-preventivos-mobile';

export default function MantenimientosPreventivosPage() {
    return <MantenimientosHistoricoPage forcedClasificacion="PREVENTIVO" DesktopView={MantenimientosPreventivosDesktop} MobileView={MantenimientosPreventivosMobile} />;
}
