// src/stores/sync-store.js
import { getQueue, removeFromQueue } from '@/lib/offline-queue';
import {
    createTicket,
    updateTicket,
    changeTicketStatus,
} from '@/features/tickets/api/tickets-api';

export const processSyncQueue = async () => {
    const queue = await getQueue();

    if (!queue.length) return;

    console.log('🔄 Sync iniciado...', queue.length);

    for (const item of queue) {
        try {
            switch (item.type) {
                case 'CREATE_TICKET':
                    await createTicket(item.payload);
                    break;

                case 'UPDATE_TICKET':
                    await updateTicket(item.payload.id, item.payload);
                    break;

                case 'CHANGE_STATUS':
                    await changeTicketStatus(item.payload.id, item.payload);
                    break;

                default:
                    console.warn('Tipo desconocido:', item.type);
            }

            // ✅ Si sale bien → eliminar de la cola
            await removeFromQueue(item.id);

        } catch (err) {
            console.error('❌ Sync error:', err);
            return; // detener si algo falla (importante)
        }
    }

    console.log('✅ Sync completado');

    // 🔥 Notificar a la app
    window.dispatchEvent(new Event('cuadra-sync-complete'));
};