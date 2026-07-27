import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useState } from 'react';
import { OauthWebView } from '@open-webui-react-native/mobile/auth/features/oauth-web-view';
import { AppButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';

interface OdicSignInProps {
  // Display name from /api/config (OAUTH_PROVIDER_NAME), e.g. "Test SSO" / "Keycloak".
  providerName: string;
  onSuccess?: () => void;
}

export function OdicSignIn({ providerName, onSuccess }: OdicSignInProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OIDC_FORM');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSignInPress = async (): Promise<void> => setIsModalVisible(true);

  const handleCloseModal = (): void => setIsModalVisible(false);

  const handleToken = async (token: string): Promise<void> => {
    authState$.signIn(token);
    // We need to delay to ensure the modal screen is closed before resetting navigation.
    await new Promise<void>((resolve) => {
      handleCloseModal();
      setTimeout(() => resolve(), 100);
    });
    onSuccess?.();
  };

  return (
    <Fragment>
      <AppButton text={translate('BUTTON_CONTINUE_WITH', { provider: providerName })} onPress={handleSignInPress} />
      <OauthWebView
        isVisible={isModalVisible}
        provider={Provider.OIDC}
        onClose={handleCloseModal}
        onGetToken={handleToken}
      />
    </Fragment>
  );
}
