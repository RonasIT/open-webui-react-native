import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { ToastProvider } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/toast';
import { useLogout } from '@open-web-ui-mobile-client-react-native/mobile/shared/features/use-logout';
import { fonts } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/styles';
import { StatusBar, View } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { navigationConfig } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/app-state';
import { authState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/auth';
import {
  queryPersister,
  persistStorageConfig,
} from '@open-web-ui-mobile-client-react-native/shared/data-access/persist-query-storage';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { useSocket } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
import { useNetworkConnection } from '@open-web-ui-mobile-client-react-native/shared/features/network';
import { constants } from '@open-web-ui-mobile-client-react-native/shared/utils/config';
import { setupReactotron } from '@open-web-ui-mobile-client-react-native/shared/utils/reactotron';
import { setLanguage } from '@ronas-it/react-native-common-modules/i18n';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { ReactElement, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '../global.css';
import 'reflect-metadata';
import 'expo-dev-client';

export { ErrorBoundary } from 'expo-router';

const translations = {
  [constants.defaultLocale]: {
    ...require('i18n/mobile/app/en.json'),
    ...require('i18n/mobile/shared/en.json'),
    ...require('i18n/mobile/auth/en.json'),
    ...require('i18n/mobile/chat/en.json'),
    ...require('i18n/mobile/profile/en.json'),
    ...require('i18n/mobile/folder/en.json'),
  },
};

const useLanguage = setLanguage(translations, constants.defaultLocale);

setupReactotron('open-web-ui');

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
      <StatusBar className='bg-background-primary' />
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

export default function RootLayout(): ReactElement | null {
  useLanguage(constants.defaultLocale);
  const [isFontsLoaded] = useFonts(fonts);

  useEffect(() => {
    if (isFontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isFontsLoaded]);

  if (!isFontsLoaded) {
    return null;
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
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
              <App />
            </BottomSheetModalProvider>
          </ToastProvider>
        </PersistQueryClientProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}
