import { observable, Observable } from '@legendapp/state';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { constants, LanguageCode } from '@open-webui-react-native/shared/utils/config';

const getInitialLocale = (): LanguageCode => {
  const storedLocale = appStorageService.locale.get();

  return Object.values(LanguageCode).includes(storedLocale as LanguageCode)
    ? (storedLocale as LanguageCode)
    : constants.defaultLocale;
};

interface AppState {
  init: () => Promise<void>;
  isInitialLoadingFinished: boolean;
  setIsOfflineMode: (isConnected: boolean) => void;
  isOfflineMode: boolean;
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
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
  setLocale: (locale) => {
    appStorageService.locale.set(locale);
    appState$.locale.set(locale);
  },
  isInitialLoadingFinished: false,
  isOfflineMode: false,
  locale: getInitialLocale(),
});
