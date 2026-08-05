import React from 'react';
import { Icon } from '@/components/ui/z_index';
import {
  BIDetailModal,
  BIErrorState,
  BIMaquinariaFilters,
  BIMaquinariaMobileCards,
} from '../components/bi/bi-maquinaria-parts';

export default function MaquinariaBIMobile({ bi, agrupacion }) {
  if (!bi.canUseBI) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Icon name="lock" size="lg" className="mx-auto text-slate-300" />
        <h2 className="mt-3 text-base font-black text-slate-800">Indicadores no disponibles</h2>
        <p className="text-xs font-medium text-slate-500">Tu rol actual no tiene acceso a estas metricas internas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      <BIMaquinariaFilters
        filters={bi.filters}
        catalogs={bi.catalogs}
        onChange={bi.updateFilters}
        onRefresh={bi.refresh}
        refreshing={bi.refreshing}
        mobile
      />

      <BIErrorState errorInfo={bi.errorInfo} onRetry={bi.refresh} />

      <BIMaquinariaMobileCards
        rows={bi.data}
        loading={bi.loading}
        metadata={bi.metadata}
        agrupacion={agrupacion}
        onPageChange={bi.setPage}
        onOpenDetail={bi.openDetail}
      />

      <BIDetailModal
        detailState={bi.detailState}
        onClose={bi.closeDetail}
        onPageChange={(page) => bi.openDetail(bi.detailState.maquinaId, page)}
      />
    </div>
  );
}
