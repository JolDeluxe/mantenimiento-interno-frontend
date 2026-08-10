import React from 'react';
import { Button, GlassViewToggle } from '@/components/ui/z_index';

const MAQUINARIA_VIEWS = [
  { id: 'MAQUINAS', label: 'Máquinas', icon: 'precision_manufacturing' },
  { id: 'EQUIPO', label: 'KPI Equipos', icon: 'table_chart' },
  { id: 'PROCESO', label: 'KPI Familias', icon: 'account_tree' },
  { id: 'AREA', label: 'KPI Ubicaciones', icon: 'location_on' },
];

export function MaquinariaViewTabs({ value, onChange, mobile = false }) {
  if (mobile) {
    return (
      <div className="sticky top-0 z-30 flex justify-center py-1">
        <div className="w-full overflow-x-auto no-scrollbar">
          <GlassViewToggle
            options={MAQUINARIA_VIEWS.map((item) => ({
              id: item.id,
              label: item.label,
              icon: item.icon,
            }))}
            value={value}
            onChange={onChange}
            activeVariant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-30 flex flex-wrap gap-3 border-b border-slate-300/60 bg-cuadra-arena px-1 py-2">
      {MAQUINARIA_VIEWS.map((item) => (
        <Button
          key={item.id}
          size="sm"
          variant={value === item.id ? 'primario' : 'ghost'}
          icon={item.icon}
          iconSize="md"
          onClick={() => onChange(item.id)}
          className={value === item.id ? 'shadow-md' : 'bg-white'}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
