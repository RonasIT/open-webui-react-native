import { useSelector } from '@legendapp/state/react';
import { AppSplashScreen } from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import {
  navigationConfig,
  useInitialNavigation,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/app-state';
import { authState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/auth';
import { useRouter } from 'expo-router';
import { ReactElement, useEffect } from 'react';

export default function RootScreen(): ReactElement {
  const router = useRouter();
  const { resetToCreateChatScreen } = useInitialNavigation();

  const isAuthenticated = useSelector(authState$.isAuthenticated);
  const isInitialLoadingFinished = useSelector(appState$.isInitialLoadingFinished);

  useEffect(() => {
    if (!isInitialLoadingFinished) return;

    if (!isAuthenticated) {
      router.replace(`/${navigationConfig.auth.signIn}`);

      return;
    }
    resetToCreateChatScreen();
  }, [isInitialLoadingFinished, isAuthenticated]);

  return <AppSplashScreen />;
}
