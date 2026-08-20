import { observable, Observable } from '@legendapp/state';
import { getLocales } from 'expo-localization';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { constants, LanguageCode, MarkdownRenderer } from '@open-webui-react-native/shared/utils/config';

const isSupportedLocale = (locale?: string | null): locale is LanguageCode =>
  Object.values(LanguageCode).includes(locale as LanguageCode);

const isSupportedMarkdownRenderer = (renderer?: string | null): renderer is MarkdownRenderer =>
  Object.values(MarkdownRenderer).includes(renderer as MarkdownRenderer);

const getInitialLocale = (): LanguageCode => {
  const storedLocale = appStorageService.locale.get();

  if (isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  const deviceLanguageCode = getLocales()[0]?.languageCode;

  return isSupportedLocale(deviceLanguageCode) ? deviceLanguageCode : constants.defaultLocale;
};

const getInitialMarkdownRenderer = (): MarkdownRenderer => {
  const storedRenderer = appStorageService.markdownRenderer.get();

  if (isSupportedMarkdownRenderer(storedRenderer)) {
    return storedRenderer;
  }

  return constants.defaultMarkdownRenderer;
};

interface AppState {
  init: () => Promise<void>;
  isInitialLoadingFinished: boolean;
  setIsOfflineMode: (isConnected: boolean) => void;
  isOfflineMode: boolean;
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  markdownRenderer: MarkdownRenderer;
  setMarkdownRenderer: (renderer: MarkdownRenderer) => void;
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
  setMarkdownRenderer: (renderer) => {
    appStorageService.markdownRenderer.set(renderer);
    appState$.markdownRenderer.set(renderer);
  },
  isInitialLoadingFinished: false,
  isOfflineMode: false,
  locale: getInitialLocale(),
  markdownRenderer: getInitialMarkdownRenderer(),
});
