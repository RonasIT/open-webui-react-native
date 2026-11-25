import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

const NOTICE_DURATION = 5000;
const NOTICE_REPEAT_INTERVAL = 15000;

// NOTE: A proxy that blocks the device rejects every request: the person needs its notice once, not per request.
let lastShownAt = 0;

export const showProxyRejectionNotice = (): void => {
  if (Date.now() - lastShownAt < NOTICE_REPEAT_INTERVAL) {
    return;
  }

  lastShownAt = Date.now();
  ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_PROXY_REJECTION'), NOTICE_DURATION);
};
