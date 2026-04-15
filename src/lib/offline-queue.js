// src/lib/offline-queue.js
import { readSnapshot, writeSnapshot } from '@/lib/idb';

const QUEUE_STORE = 'offline_queue';
const QUEUE_KEY = 'queue_v1';

// 🔥 Agregar acción a la cola
export const enqueue = async (action) => {
    try {
        const snapshot = await readSnapshot(QUEUE_STORE, QUEUE_KEY);
        const current = snapshot?.data || [];

        const updated = [
            ...current,
            {
                ...action,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                status: 'pending',
            },
        ];

        await writeSnapshot(QUEUE_STORE, updated, QUEUE_KEY);
    } catch (err) {
        console.error('enqueue error:', err);
    }
};

// 🔥 Obtener cola
export const getQueue = async () => {
    try {
        const snapshot = await readSnapshot(QUEUE_STORE, QUEUE_KEY);
        return snapshot?.data || [];
    } catch {
        return [];
    }
};

// 🔥 Limpiar cola
export const clearQueue = async () => {
    await writeSnapshot(QUEUE_STORE, [], QUEUE_KEY);
};

// 🔥 Remover item específico
export const removeFromQueue = async (id) => {
    const queue = await getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await writeSnapshot(QUEUE_STORE, filtered, QUEUE_KEY);
};