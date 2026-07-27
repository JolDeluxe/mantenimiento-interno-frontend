import { useEffect, useState } from 'react';
import { ClockArrowUp } from 'lucide-react';
import { getOfflineQueueSummary } from '@/lib/offline-mutation-queue';

export const OfflinePendingBadge = () => {
  const [summary, setSummary] = useState({ count: 0, itemCount: 0 });

  useEffect(() => {
    let mounted = true;

    const loadSummary = () => {
      getOfflineQueueSummary()
        .then((nextSummary) => {
          if (mounted) setSummary(nextSummary);
        })
        .catch(() => {
          if (mounted) setSummary({ count: 0, itemCount: 0 });
        });
    };

    loadSummary();

    window.addEventListener('cuadra-offline-queue-changed', loadSummary);
    window.addEventListener('online', loadSummary);
    window.addEventListener('focus', loadSummary);

    return () => {
      mounted = false;
      window.removeEventListener('cuadra-offline-queue-changed', loadSummary);
      window.removeEventListener('online', loadSummary);
      window.removeEventListener('focus', loadSummary);
    };
  }, []);

  if (!summary.itemCount) return null;

  const label = summary.itemCount === 1
    ? '1 acción pendiente de envío'
    : `${summary.itemCount} tareas pendientes de envío`;

  return (
    <div className="fixed bottom-24 left-4 z-[70] print:hidden">
      <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm">
        <ClockArrowUp size={15} />
        <span>{label}</span>
      </div>
    </div>
  );
};
