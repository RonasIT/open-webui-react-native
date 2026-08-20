import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { ToastProvider } from '@open-webui-react-native/mobile/shared/features/toast';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import { fonts } from '@open-webui-react-native/mobile/shared/ui/styles';
import { StatusBar, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { navigationConfig } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import {
  queryPersister,
  persistStorageConfig,
} from '@open-webui-react-native/shared/data-access/persist-query-storage';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { useSocket } from '@open-webui-react-native/shared/data-access/websocket';
import { useNetworkConnection } from '@open-webui-react-native/shared/features/network';
import { analyticsService } from '@open-webui-react-native/shared/utils/analytics-service';
import { constants, LanguageCode } from '@open-webui-react-native/shared/utils/config';
import { setupReactotron } from '@open-webui-react-native/shared/utils/reactotron';
import { supabaseService } from '@open-webui-react-native/shared/utils/supabase-service';
import { i18n, setLanguage } from '@ronas-it/react-native-common-modules/i18n';
import * as Sentry from '@sentry/react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { useMakePlural } from 'i18n-js';
import { de, en, es, fr, ja, pt, ru, zh } from 'make-plural';
import { ReactElement, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import 'reflect-metadata';
import 'expo-dev-client';
import 'react-native-url-polyfill/auto';

export { ErrorBoundary } from 'expo-router';

const reactNavigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: Constants.expoConfig?.extra?.sentry?.dsn,
  environment: Constants.expoConfig?.extra?.env,
  debug: false,
  integrations: [reactNavigationIntegration],
  enabled: !__DEV__,
});

const translations = {
  [LanguageCode.ENGLISH]: {
    ...require('i18n/mobile/app/en.json'),
    ...require('i18n/mobile/shared/en.json'),
    ...require('i18n/mobile/auth/en.json'),
    ...require('i18n/mobile/chat/en.json'),
    ...require('i18n/mobile/profile/en.json'),
    ...require('i18n/mobile/folder/en.json'),
  },
  [LanguageCode.RUSSIAN]: {
    ...require('i18n/mobile/app/ru.json'),
    ...require('i18n/mobile/shared/ru.json'),
    ...require('i18n/mobile/auth/ru.json'),
    ...require('i18n/mobile/chat/ru.json'),
    ...require('i18n/mobile/profile/ru.json'),
    ...require('i18n/mobile/folder/ru.json'),
  },
  [LanguageCode.SPANISH]: {
    ...require('i18n/mobile/app/es.json'),
    ...require('i18n/mobile/shared/es.json'),
    ...require('i18n/mobile/auth/es.json'),
    ...require('i18n/mobile/chat/es.json'),
    ...require('i18n/mobile/profile/es.json'),
    ...require('i18n/mobile/folder/es.json'),
  },
  [LanguageCode.PORTUGUESE]: {
    ...require('i18n/mobile/app/pt.json'),
    ...require('i18n/mobile/shared/pt.json'),
    ...require('i18n/mobile/auth/pt.json'),
    ...require('i18n/mobile/chat/pt.json'),
    ...require('i18n/mobile/profile/pt.json'),
    ...require('i18n/mobile/folder/pt.json'),
  },
  [LanguageCode.FRENCH]: {
    ...require('i18n/mobile/app/fr.json'),
    ...require('i18n/mobile/shared/fr.json'),
    ...require('i18n/mobile/auth/fr.json'),
    ...require('i18n/mobile/chat/fr.json'),
    ...require('i18n/mobile/profile/fr.json'),
    ...require('i18n/mobile/folder/fr.json'),
  },
  [LanguageCode.GERMAN]: {
    ...require('i18n/mobile/app/de.json'),
    ...require('i18n/mobile/shared/de.json'),
    ...require('i18n/mobile/auth/de.json'),
    ...require('i18n/mobile/chat/de.json'),
    ...require('i18n/mobile/profile/de.json'),
    ...require('i18n/mobile/folder/de.json'),
  },
  [LanguageCode.CHINESE]: {
    ...require('i18n/mobile/app/zh.json'),
    ...require('i18n/mobile/shared/zh.json'),
    ...require('i18n/mobile/auth/zh.json'),
    ...require('i18n/mobile/chat/zh.json'),
    ...require('i18n/mobile/profile/zh.json'),
    ...require('i18n/mobile/folder/zh.json'),
  },
  [LanguageCode.JAPANESE]: {
    ...require('i18n/mobile/app/ja.json'),
    ...require('i18n/mobile/shared/ja.json'),
    ...require('i18n/mobile/auth/ja.json'),
    ...require('i18n/mobile/chat/ja.json'),
    ...require('i18n/mobile/profile/ja.json'),
    ...require('i18n/mobile/folder/ja.json'),
  },
};

Object.entries({ en, ru, es, pt, fr, de, zh, ja }).forEach(([locale, pluralizer]) => {
  i18n.pluralization.register(locale, useMakePlural({ pluralizer }));
});

const useLanguage = setLanguage(translations, constants.defaultLocale);

setupReactotron('open-web-ui');
analyticsService.init();
supabaseService.init();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// eslint-disable-next-line @typescript-eslint/naming-convention
export const unstable_settings = {
  initialRouteName: 'index',
};

function App(): ReactElement | null {
  const { logout } = useLogout();
  const { isOfflineMode } = useNetworkConnection();

  const isAuthenticated = useSelector(authState$.isAuthenticated);
  const isUnauthorized = useSelector(authState$.isUnauthorized);

  useSocket({ isAuthenticated, isOfflineMode });

  useEffect(() => {
    appState$.init();
  }, []);

  useEffect(() => {
    if (isUnauthorized && !isOfflineMode) {
      logout();
    }
  }, [isUnauthorized, isOfflineMode]);

  return (
    <View className='bg-background-primary flex-1'>
      <StatusBar className='bg-background-primary' translucent />
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen name={navigationConfig.auth.root} options={{ headerShown: false }} />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name={navigationConfig.main.root} options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

function RootLayout(): ReactElement | null {
  const locale = useSelector(appState$.locale);
  useLanguage(locale);
  const [isFontsLoaded] = useFonts(fonts);
  const navigationContainerRef = useNavigationContainerRef();

  useEffect(() => {
    if (navigationContainerRef) {
      reactNavigationIntegration.registerNavigationContainer(navigationContainerRef);
    }
  }, [navigationContainerRef]);

  useEffect(() => {
    if (isFontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isFontsLoaded]);

  if (!isFontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{
              persister: queryPersister,
              maxAge: persistStorageConfig.maxAge,
              dehydrateOptions: {
                shouldDehydrateQuery: (query) => query.meta?.persist !== false,
              },
            }}>
            <ToastProvider>
              <BottomSheetModalProvider>
                <App key={locale} />
              </BottomSheetModalProvider>
            </ToastProvider>
          </PersistQueryClientProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
