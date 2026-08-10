import React, { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import {
  BIDetailModal,
  BIErrorState,
  BIMaquinariaFilters,
  BIMaquinariaSummary,
  BIMaquinariaTable,
  BIExportModal,
} from '../components/bi/bi-maquinaria-parts';

const VIEW_COPY = {
  EQUIPO: {
    title: 'KPI por Equipo',
    subtitle: 'Indicadores correctivos por equipo.',
  },
  PROCESO: {
    title: 'KPI por Familia',
    subtitle: 'Indicadores correctivos agrupados por familia TPM.',
  },
  AREA: {
    title: 'KPI por Ubicación',
    subtitle: 'Indicadores correctivos agrupados por ubicación.',
  },
};

export default function MaquinariaBIDesktop({ bi, agrupacion }) {
  const copy = VIEW_COPY[agrupacion] || VIEW_COPY.EQUIPO;
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!bi.canUseBI) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Icon name="lock" size="lg" className="mx-auto text-slate-300" />
        <h2 className="mt-3 text-lg font-black text-slate-800">Indicadores de maquinaria no disponibles</h2>
        <p className="text-sm font-medium text-slate-500">Tu rol actual no tiene acceso a estas metricas internas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 fuente-titulos">{copy.title}</h1>
        <p className="text-sm font-medium text-slate-500">{copy.subtitle}</p>
      </div>

      <BIMaquinariaFilters
        filters={bi.filters}
        catalogs={bi.catalogs}
        onChange={bi.updateFilters}
        onRefresh={bi.refresh}
        refreshing={bi.refreshing}
        onExport={() => setIsExportOpen(true)}
      />

      <BIErrorState errorInfo={bi.errorInfo} onRetry={bi.refresh} />

      {bi.resumen && (
        <BIMaquinariaSummary
          resumen={bi.resumen}
          metadata={bi.metadata}
          summary={bi.summary}
          agrupacion={agrupacion}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm bi-table-container relative">
        <style>{`
          .bi-table-container [class*="max-h-"] {
            max-h: calc(100vh - 480px) !important;
          }
          .bi-table-container thead {
            z-index: 10 !important;
          }
        `}</style>
        <BIMaquinariaTable
          rows={bi.data}
          loading={bi.loading}
          metadata={bi.metadata}
          agrupacion={agrupacion}
          onPageChange={bi.setPage}
          onOpenDetail={bi.openDetail}
          ordenarPor={bi.filters.ordenarPor}
          direccion={bi.filters.direccion}
          onSortChange={bi.updateFilters}
        />
      </div>

      <BIDetailModal
        detailState={bi.detailState}
        onClose={bi.closeDetail}
        onPageChange={(page) => bi.openDetail(bi.detailState.maquinaId, page)}
      />

      <BIExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filters={bi.filters}
        catalogs={bi.catalogs}
      />
    </div>
  );
}
