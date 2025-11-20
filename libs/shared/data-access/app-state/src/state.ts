import { observable, Observable } from '@legendapp/state';
import { authState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/auth';
import { cookieService } from '@open-web-ui-mobile-client-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';

interface AppState {
  init: () => Promise<void>;
  isInitialLoadingFinished: boolean;
  setIsOfflineMode: (isConnected: boolean) => void;
  isOfflineMode: boolean;
}

export const appState$: Observable<AppState> = observable<AppState>({
  init: async () => {
    const token = appStorageService.token.get();

    if (token) {
      authState$.isAuthenticated.set(true);
      cookieService.setToken(token);
    }

    appState$.isInitialLoadingFinished.set(true);
  },
  setIsOfflineMode: (isOffline) => {
    appState$.isOfflineMode.set(isOffline);
  },
  isInitialLoadingFinished: false,
  isOfflineMode: false,
});
