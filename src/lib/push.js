import api from '@/lib/axios';

let ensurePushSubscriptionPromise = null;
let lastEnsureAttemptAt = 0;
const SERVICE_WORKER_READY_TIMEOUT_MS = 1500;

const withTimeout = (promise, timeoutMs, message) => {
    let timeoutId;

    const timeout = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
        window.clearTimeout(timeoutId);
    });
};

/**
 * Convierte la VAPID public key de Base64Url a Uint8Array,
 * formato que requiere el PushManager de los navegadores.
 */
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const supportsPush = () => (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
);

const syncSubscriptionWithBackend = async (subscription) => {
    const { endpoint, keys } = subscription.toJSON();

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        console.warn('[Push] Suscripción incompleta; no se sincronizó con backend.');
        return null;
    }

    await api.post('/api/notificaciones/subscribe', {
        endpoint,
        keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
        },
    });

    return subscription;
};

export const getCurrentPushEndpoint = async () => {
    try {
        if (!supportsPush() || Notification.permission !== 'granted') return null;

        const registration = await withTimeout(
            navigator.serviceWorker.ready,
            SERVICE_WORKER_READY_TIMEOUT_MS,
            'Service Worker no estuvo listo a tiempo.'
        );
        const subscription = await registration.pushManager.getSubscription();

        return subscription?.endpoint || null;
    } catch (error) {
        console.warn('[Push] No se pudo obtener endpoint actual:', error);
        return null;
    }
};

/**
 * Repara o sincroniza una suscripción existente sin pedir permisos.
 * Si el permiso ya fue concedido y el navegador perdió la suscripción,
 * crea una nueva y la registra con upsert en el backend.
 *
 * @returns {Promise<PushSubscription|null>}
 */
export const ensurePushSubscription = async ({ force = false, minIntervalMs = 0 } = {}) => {
    if (ensurePushSubscriptionPromise) return ensurePushSubscriptionPromise;

    ensurePushSubscriptionPromise = (async () => {
        try {
            if (!supportsPush()) {
                console.warn('[Push] No soportado en este navegador.');
                return null;
            }

            if (Notification.permission !== 'granted') {
                return null;
            }

            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            const now = Date.now();
            if (
                subscription &&
                !force &&
                minIntervalMs > 0 &&
                now - lastEnsureAttemptAt < minIntervalMs
            ) {
                return null;
            }

            lastEnsureAttemptAt = Date.now();

            if (!subscription) {
                const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.warn('[Push] VAPID public key no configurada.');
                    return null;
                }

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }

            const synced = await syncSubscriptionWithBackend(subscription);
            if (synced) console.log('[Push] Suscripción sincronizada.');
            return synced;
        } catch (error) {
            console.error('[Push] Error al asegurar suscripción:', error);
            return null;
        } finally {
            ensurePushSubscriptionPromise = null;
        }
    })();

    return ensurePushSubscriptionPromise;
};

/**
 * Pide permiso al usuario, crea o reutiliza la suscripción push
 * y la registra en el backend.
 *
 * Llamar desde DashboardLayout (o similar) una vez que el usuario está autenticado:
 *   import { subscribeToPush } from '@/lib/push';
 *   useEffect(() => { subscribeToPush(); }, []);
 *
 * @returns {Promise<PushSubscription|null>}
 */
export const subscribeToPush = async () => {
    try {
        if (!supportsPush()) {
            console.warn('[Push] No soportado en este navegador.');
            return null;
        }

        let permission = Notification.permission;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
            console.warn('[Push] Permiso denegado por el usuario.');
            return null;
        }

        const subscription = await ensurePushSubscription({ force: true });
        if (subscription) console.log('[Push] Suscripción activada.');
        return subscription;
    } catch (error) {
        // No lanzamos — el sistema sigue funcionando sin push
        console.error('[Push] Error al suscribirse:', error);
        return null;
    }
};
