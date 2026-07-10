import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQrPrintStore } from '../stores/qr-print-store';
import { QrCodeCard } from '../components';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { getMaquinas } from '../api/maquinaria-api';
import { notify } from '@/components/notification/adaptive-notify';

const QR_POR_HOJA = 4;

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function QrBatchPrintPage() {
  const navigate = useNavigate();
  const {
    selectedMaquinas,
    clearSelection,
    loadedQrIds,
    markQrLoaded,
    resetLoadedQr
  } = useQrPrintStore();
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

  // Cada vez que cambia el conjunto de máquinas seleccionadas, reinicia el contador
  // de QR cargados para volver a esperar a que todos generen su imagen.
  useEffect(() => {
    resetLoadedQr();
  }, [selectedMaquinas.join(','), resetLoadedQr]);

  const totalQr = selectedList.length;
  const cargados = loadedQrIds.filter((id) => selectedMaquinas.includes(id)).length;
  const qrListos = totalQr > 0 && cargados >= totalQr;

  const handlePrint = () => {
    if (!qrListos) return;
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

  const grupos = chunkArray(selectedList, QR_POR_HOJA);

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

          <div className="flex flex-wrap gap-2.5 items-center">
            {totalQr > 0 && !qrListos && (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Spinner size="xs" />
                Generando QR ({cargados}/{totalQr})...
              </span>
            )}
            <Button
              variant="primario"
              size="sm"
              icon="print"
              disabled={selectedList.length === 0 || !qrListos}
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
        <div
          id="printable-area"
          className="p-4 bg-white print:p-0 print:absolute print:left-0 print:top-0 print:m-0 print:w-full"
        >
          {grupos.map((grupo, idx) => {
            const esUltima = idx === grupos.length - 1;
            return (
              <div
                key={idx}
                className={`grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:grid-rows-2 print:gap-8 print:h-[100vh] print:w-full print:place-items-center mb-6 print:mb-0 ${
                  esUltima ? '' : 'print:break-after-page'
                }`}
              >
                {grupo.map((maquina) => (
                  <QrCodeCard
                    key={maquina.id}
                    maquina={maquina}
                    onLoad={markQrLoaded}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}