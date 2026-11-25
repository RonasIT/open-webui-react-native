import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AppState, AppStateStatus } from 'react-native';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

const NOTICE_DURATION = 5000;

// NOTE: A proxy that blocks the device rejects every request: the person needs its notice once, not per request.
// The notice shows again after a request gets through or the app comes back from the background.
let isNoticeShown = false;
let wasInBackground = false;

// NOTE: iOS also passes through `inactive` for Control Center, Face ID or a system alert; only a real return counts.
AppState.addEventListener('change', (appState: AppStateStatus) => {
  if (appState === 'background') {
    wasInBackground = true;
  } else if (appState === 'active' && wasInBackground) {
    wasInBackground = false;
    isNoticeShown = false;
  }
});

export const showProxyRejectionNotice = (): void => {
  if (isNoticeShown) {
    return;
  }

  isNoticeShown = true;
  ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_PROXY_REJECTION'), NOTICE_DURATION);
};

export const resetProxyRejectionNotice = <T>(response: T): T => {
  isNoticeShown = false;

  return response;
};
