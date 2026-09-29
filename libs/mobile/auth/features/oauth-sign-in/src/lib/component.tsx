import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useState } from 'react';
import { OauthWebView } from '@open-webui-react-native/mobile/auth/features/oauth-web-view';
import { AppButton, IconName } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import {
  oauthProvidersConfig,
  Provider,
  SupportedOauthProvider,
} from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';

const oauthProviderIcons: Partial<Record<SupportedOauthProvider, IconName>> = {
  [Provider.GOOGLE]: 'googleLogo',
  [Provider.MICROSOFT]: 'microsoftLogo',
};

interface OauthSignInProps {
  provider: SupportedOauthProvider;
  // Display name from /api/config `oauth.providers`, used only when the provider has `hasServerName`.
  providerName?: string;
  onSuccess?: () => void;
}

export function OauthSignIn({ provider, providerName, onSuccess }: OauthSignInProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OAUTH_SIGN_IN');
  const { name, hasServerName } = oauthProvidersConfig[provider];
  const displayName = (hasServerName && providerName) || name;

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
      <AppButton
        text={translate('BUTTON_CONTINUE_WITH', { provider: displayName })}
        iconName={oauthProviderIcons[provider]}
        onPress={handleSignInPress}
      />
      <OauthWebView
        isVisible={isModalVisible}
        provider={provider}
        onClose={handleCloseModal}
        onGetToken={handleToken}
      />
    </Fragment>
  );
}
