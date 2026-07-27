import { notify } from '@/components/notification/adaptive-notify';
import { OFFLINE_QUEUE_MESSAGES } from '@/lib/offline-mutation-queue';

export const isQueuedResult = (result) => result?.outcome === 'queued';

export const notifyQueuedResult = (result) => {
  const count = result?.itemCount || 1;
  notify.info(count > 1 ? OFFLINE_QUEUE_MESSAGES.batch(count) : OFFLINE_QUEUE_MESSAGES.single);
};

export const notifyCreateSuccess = (message) => {
  notify.success(message);
};
