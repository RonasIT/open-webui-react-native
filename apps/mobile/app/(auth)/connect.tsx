import { useSelector } from '@legendapp/state/react';
import { Connect } from '@open-webui-react-native/mobile/auth/features/connect';
import { NoConnectionBanner } from '@open-webui-react-native/mobile/shared/ui/no-connection-banner';
import { ScreenWrapper } from '@open-webui-react-native/mobile/shared/ui/screen-wrapper';
import { navigationConfig, useInitialNavigation } from '@open-webui-react-native/mobile/shared/utils/navigation';
import { appState$ } from '@open-webui-react-native/shared/data-access/app-state';
import { useNavigateOnce } from '@open-webui-react-native/shared/utils/navigation';
import { ReactElement } from 'react';

export default function ConnectScreen(): ReactElement {
  const { resetToCreateChatScreen } = useInitialNavigation();
  const navigateOnce = useNavigateOnce();

  const isOfflineMode = useSelector(appState$.isOfflineMode);

  return (
    <ScreenWrapper isKeyboardAvoiding safeAreaProps={{ edges: ['top'] }}>
      <NoConnectionBanner isVisible={isOfflineMode} />
      <Connect
        onContinue={() => navigateOnce(`/${navigationConfig.auth.signIn}`)}
        onSignIn={resetToCreateChatScreen} />
    </ScreenWrapper>
  );
}
