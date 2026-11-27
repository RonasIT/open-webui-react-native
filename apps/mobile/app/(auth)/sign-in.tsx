import { useSelector } from '@legendapp/state/react';
import { SignIn } from '@open-webui-react-native/mobile/auth/features/sign-in';
import { NoConnectionBanner } from '@open-webui-react-native/mobile/shared/ui/no-connection-banner';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { AppHeader } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useInitialNavigation } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { useRouter } from 'expo-router';
import { ReactElement } from 'react';

export default function SignInScreen(): ReactElement {
  const router = useRouter();
  const { resetToCreateChatScreen } = useInitialNavigation();

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  return (
    <ScreenWrapper
      isKeyboardAvoiding
      safeAreaProps={{ edges: [] }}
      screenProps={{ header: <AppHeader title='' onGoBack={router.back} /> }}>
      <NoConnectionBanner isVisible={isOfflineMode} />
      <SignIn onSuccess={resetToCreateChatScreen} />
    </ScreenWrapper>
  );
}
