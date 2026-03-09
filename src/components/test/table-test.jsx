import React, { useState } from 'react';
import { Table, Badge, Button, Icon, Card, CardBody } from '@/components/ui/z_index';

export const TableTester = () => {
  const [sort, setSort] = useState({ key: 'fecha', direction: 'desc' });
  
  // Datos ficticios imitando el esquema de la BD
  const mockTickets = [
    { id: 1, folio: 'TCK-001', titulo: 'Fuga de agua en baños', prioridad: 'ALTA', estado: 'PENDIENTE', fecha: '2026-03-01' },
    { id: 2, folio: 'TCK-002', titulo: 'Mantenimiento clima', prioridad: 'MEDIA', estado: 'CONCLUIDA', fecha: '2026-03-02' },
    { id: 3, folio: 'TCK-003', titulo: 'Cambio de luminaria 4', prioridad: 'BAJA', estado: 'EN_REVISION', fecha: '2026-03-03' },
    { id: 4, folio: 'TCK-004', titulo: 'Pintura exterior fachada', prioridad: 'MEDIA', estado: 'CANCELADA', fecha: '2026-02-28' },
  ];

  const columns = [
    { 
      header: 'Folio', 
      accessorKey: 'folio', 
      sortable: true,
      cell: (row) => <span className="font-bold text-marca-primario">{row.folio}</span> 
    },
    { header: 'Título de Tarea', accessorKey: 'titulo' },
    { 
      header: 'Prioridad', 
      accessorKey: 'prioridad',
      align: 'center',
      cell: (row) => {
        const variants = { ALTA: 'error', MEDIA: 'warning', BAJA: 'success' };
        return <Badge variant={variants[row.prioridad]}>{row.prioridad}</Badge>;
      }
    },
    { header: 'Registro', accessorKey: 'fecha', sortable: true },
    { 
      header: 'Estado', 
      accessorKey: 'estado',
      cell: (row) => (
        <span className={`font-bold text-xs ${row.estado === 'CONCLUIDA' ? 'text-green-600' : 'text-slate-500'}`}>
          {row.estado.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: 'Acciones', 
      accessorKey: 'acciones', 
      align: 'center',
      cell: (row) => (
        <div className="flex gap-2 justify-center">
          <Button variant="accion" className="p-1 h-8 w-8"><Icon name="edit" size="18px" /></Button>
          <Button variant="borrar" className="p-1 h-8 w-8"><Icon name="delete" size="18px" /></Button>
        </div>
      )
    }
  ];

  const handleSortChange = (key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    console.log(`Ordenando por: ${key}`);
  };

  return (
    <Card className="w-full max-w-5xl mx-auto my-8">
      <CardBody>
        <h2 className="text-xl font-bold mb-4 text-marca-primario flex items-center gap-2">
          <Icon name="table_chart" /> Auditoría de Componente Table
        </h2>
        <Table 
          columns={columns} 
          data={mockTickets} 
          page={1} 
          totalPages={5} 
          totalItems={20}
          sortConfig={sort}
          onSortChange={handleSortChange}
          onPageChange={(p) => console.log('Cambio a página:', p)}
          rowClassName={(row) => row.estado === 'CANCELADA' ? 'bg-red-50/50 opacity-60' : 'bg-white'}
        />
      </CardBody>
    </Card>
  );
};