import React from 'react';
import { Card, CardBody, Icon } from '@/components/ui/z_index';

export const IconTester = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardBody className="flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b pb-2 text-marca-primario flex items-center gap-2">
          <Icon name="palette" className="text-amber-500" />
          Auditoría de Variantes - Material Symbols PWA
        </h2>

        {/* 1. Variación de Relleno (FILL) */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            Eje Variable: FILL (0 = Contorno | 1 = Sólido)
          </span>
          <div className="flex gap-6 text-slate-700">
            <Icon name="favorite" fill={false} size="36px" />
            <Icon name="favorite" fill={true} size="36px" className="text-red-500" />
            
            <Icon name="star" fill={false} size="36px" />
            <Icon name="star" fill={true} size="36px" className="text-amber-500" />
          </div>
        </div>

        {/* 2. Variación de Grosor (wght) */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            Eje Variable: weight (100 a 700)
          </span>
          <div className="flex gap-6 text-slate-700 items-end">
            <div className="flex flex-col items-center">
              <Icon name="build" weight={100} size="36px" />
              <span className="text-xs mt-1">100</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="build" weight={300} size="36px" />
              <span className="text-xs mt-1">300</span>
            </div>
            <div className="flex flex-col items-center">
              <Icon name="build" weight={500} size="36px" />
              <span className="text-xs mt-1">500</span>
            </div>
            <div className="flex flex-col items-center text-blue-600">
              <Icon name="build" weight={700} size="36px" />
              <span className="text-xs font-bold mt-1">700</span>
            </div>
          </div>
        </div>

        {/* 3. Casos de Uso Reales Cuadra */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            Aplicación Práctica en Estados de Tickets
          </span>
          <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
              <Icon name="check_circle" fill={true} weight={600} size="48px" className="text-estado-resuelto" />
              <span className="text-xs font-bold text-estado-resuelto">Ticket Resuelto</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Icon name="cancel" fill={true} weight={600} size="48px" className="text-estado-rechazado" />
              <span className="text-xs font-bold text-estado-rechazado">Ticket Rechazado</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <Icon name="pending_actions" fill={false} weight={400} size="48px" className="text-estado-pendiente" />
              <span className="text-xs font-bold text-estado-pendiente">En Pausa</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};