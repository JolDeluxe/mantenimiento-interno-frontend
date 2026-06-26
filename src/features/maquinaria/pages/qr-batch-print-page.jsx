import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQrPrintStore } from '../stores/qr-print-store';
import { QrCodeCard } from '../components';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { getMaquinas } from '../api/maquinaria-api';
import { notify } from '@/components/notification/adaptive-notify';

export default function QrBatchPrintPage() {
  const navigate = useNavigate();
  const { selectedMaquinas, clearSelection } = useQrPrintStore();
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga masiva (hasta 1000 máquinas) para poder buscar en memoria del cliente (Thin Client)
    getMaquinas({ limit: 1000 })
      .then((res) => {
        setMaquinas(res?.data || []);
      })
      .catch((err) => {
        console.error(err);
        notify.error('Error al cargar el catálogo de máquinas para impresión.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const selectedList = maquinas.filter((m) => selectedMaquinas.includes(m.id));

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    clearSelection();
    notify.info('Selección de impresión QR reiniciada.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spinner size="md" className="text-marca-primario" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Cargando catálogo de equipos para impresión...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Panel de Control de Pantalla (Oculto al imprimir automáticamente mediante CSS) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-lg shadow-slate-100 hover:shadow-xl transition-all duration-300 space-y-4 print:hidden mx-1.5 my-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-marca-primario/10 rounded-xl text-marca-primario">
              <Icon name="print" size="md" />
            </div>
            <div>
              <h1 className="text-lg font-black uppercase text-slate-800 tracking-tight leading-none">
                Impresión de QR
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {selectedList.length === 1
                  ? '1 equipo seleccionado'
                  : `${selectedList.length} equipos seleccionados`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primario"
              size="sm"
              icon="print"
              disabled={selectedList.length === 0}
              onClick={handlePrint}
            >
              Imprimir Lote
            </Button>
            <Button
              variant="light"
              size="sm"
              icon="delete_sweep"
              disabled={selectedList.length === 0}
              onClick={handleClear}
            >
              Limpiar Selección
            </Button>
            <Button
              variant="cancelar"
              size="sm"
              icon="arrow_back"
              onClick={() => navigate('/maquinaria')}
            >
              Volver al Catálogo
            </Button>
          </div>
        </div>

        {selectedList.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Icon name="warning" className="text-amber-500 shrink-0" size="sm" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Sin Selección</h4>
              <p className="text-xs text-amber-700 leading-normal font-medium">
                No has seleccionado ninguna máquina para imprimir. Regresa al catálogo y activa las casillas de verificación de las máquinas que desees imprimir en lote.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contenedor del área imprimible (El CSS de index.css asegura que solo esto sea visible en la impresión física) */}
      {selectedList.length > 0 && (
        <div id="printable-area" className="p-4 bg-white print:p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-8">
            {selectedList.map((maquina) => (
              <QrCodeCard key={maquina.id} maquina={maquina} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
