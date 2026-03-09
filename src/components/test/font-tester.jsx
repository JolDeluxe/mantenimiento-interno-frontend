import React from 'react';
import { Card, CardBody, Icon } from '@/components/ui/z_index';

export const FontTester = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardBody className="flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b pb-2 text-marca-primario flex items-center gap-2">
          <Icon name="text_fields" className="text-blue-600" />
          Auditoría de Motor Tipográfico Local (PWA)
        </h2>

        {/* 1. Bebas Neue */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            [Bebas Neue] Regular 400 | Clase: .fuente-titulos
          </span>
          <h1 className="fuente-titulos text-5xl text-slate-800">
            Mantenimiento Preventivo 2026
          </h1>
        </div>

        {/* 2. Lato */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 flex flex-col gap-2">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            [Lato] 300, 400, 700, 900 | Clase: font-lectura (Heredado en Body)
          </span>
          <p className="font-lectura font-light text-xl">Lato Light (300) - El motor ha fallado.</p>
          <p className="font-lectura font-normal text-xl">Lato Regular (400) - El motor ha fallado.</p>
          <p className="font-lectura font-bold text-xl">Lato Bold (700) - El motor ha fallado.</p>
          <p className="font-lectura font-black text-xl">Lato Black (900) - El motor ha fallado.</p>
        </div>

        {/* 3. Work Sans (Forzado inline para evadir el fallback global) */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100 flex flex-col gap-2">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            [Work Sans] 400, 500, 600 | Uso directo en style para testeo
          </span>
          <p style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-normal text-xl">
            Work Sans Regular (400) - Sistema estable.
          </p>
          <p style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-medium text-xl">
            Work Sans Medium (500) - Sistema estable.
          </p>
          <p style={{ fontFamily: "'Work Sans', sans-serif" }} className="font-semibold text-xl">
            Work Sans SemiBold (600) - Sistema estable.
          </p>
        </div>

        {/* 4. JetBrains Mono */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            [JetBrains Mono] Regular 400 | Clase: font-codigo
          </span>
          <pre className="font-codigo bg-slate-800 text-emerald-400 p-4 rounded-sm text-sm overflow-x-auto">
            {`{\n  "status": 200,\n  "ticketId": "TCK-8492",\n  "message": "Operación exitosa"\n}`}
          </pre>
        </div>

        {/* 5. Material Symbols */}
        <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
          <span className="text-xs text-slate-400 block mb-2 font-codigo">
            [Material Symbols Rounded] | Componente: &lt;Icon /&gt;
          </span>
          <div className="flex gap-6 text-marca-acento">
            <Icon name="home" size="36px" />
            <Icon name="build" size="36px" />
            <Icon name="warning" size="36px" />
            <Icon name="engineering" size="36px" />
            <Icon name="task_alt" size="36px" />
            <Icon name="cancel" size="36px" className="text-estado-rechazado" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};