import { useSelector } from '@legendapp/state/react';
import { SignIn } from '@open-webui-react-native/mobile/auth/features/sign-in';
import { NoConnectionBanner } from '@open-webui-react-native/mobile/shared/ui/no-connection-banner';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { useInitialNavigation } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { ReactElement } from 'react';

export default function SignInScreen(): ReactElement {
  const { resetToCreateChatScreen } = useInitialNavigation();

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  return (
    <ScreenWrapper isKeyboardAvoiding>
      <NoConnectionBanner isVisible={isOfflineMode} />
      <SignIn onSuccess={resetToCreateChatScreen} />
    </ScreenWrapper>
  );
}
