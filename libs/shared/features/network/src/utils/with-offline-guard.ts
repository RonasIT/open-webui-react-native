import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { showOfflineToast } from './show-offline-toast';

export const withOfflineGuard = <Args extends Array<any>>(fn: (...args: Args) => void) => {
  return (...args: Args): void => {
    if (appState$.isOfflineMode.get()) {
      showOfflineToast();

      return;
    }

    fn(...args);
  };
};
