import api from '@/lib/axios';

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
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('[Push] No soportado en este navegador.');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[Push] Permiso denegado por el usuario.');
            return null;
        }

        const registration = await navigator.serviceWorker.ready;

        // Reutilizamos suscripción existente si ya hay una
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const vapidKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey,
            });
        }

        const { endpoint, keys } = subscription.toJSON();

        await api.post('/api/notificaciones/subscribe', {
            endpoint,
            keys: {
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        console.log('[Push] Suscripción activada ✅');
        return subscription;
    } catch (error) {
        // No lanzamos — el sistema sigue funcionando sin push
        console.error('[Push] Error al suscribirse:', error);
        return null;
    }
};