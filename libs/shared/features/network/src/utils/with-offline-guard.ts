import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export const withOfflineGuard = <Args extends Array<any>>(fn: (...args: Args) => void) => {
  return (...args: Args): void => {
    if (appState$.isOfflineMode.get()) {
      ToastService.show(i18n.t('SHARED.COMMON.TEXT_DISABLED_IN_OFFLINE_MODE'));

      return;
    }

    fn(...args);
  };
};
