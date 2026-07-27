import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { AppButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';

export function OdicSignIn(): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OIDC_FORM');

  const handlePress = (): void => undefined;

  return <AppButton text={translate('BUTTON_CONTINUE_WITH_SSO')} onPress={handlePress} />;
}
