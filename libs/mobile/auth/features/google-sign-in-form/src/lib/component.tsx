import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { Fragment, ReactElement, useState } from 'react';
import { AppButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { OauthWebViewModal } from './components';

interface GoogleSignInFormProps {
  onSuccess?: () => void;
}

export function GoogleSignInForm({ onSuccess }: GoogleSignInFormProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.GOOGLE_FORM');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSignInWithGooglePress = async (): Promise<void> => setIsModalVisible(true);

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
        text={translate('BUTTON_CONTINUE_WITH_GOOGLE')}
        iconName='googleLogo'
        onPress={handleSignInWithGooglePress}
      />
      <OauthWebViewModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onGetToken={handleToken} />
    </Fragment>
  );
}
