import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { EmailSignInForm } from '@open-webui-react-native/mobile/auth/features/email-sign-in-form';
import { GoogleSignInForm } from '@open-webui-react-native/mobile/auth/features/google-sign-in-form';
import { OdicSignIn } from '@open-webui-react-native/mobile/auth/features/odic-sign-in';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider } from '@open-webui-react-native/shared/data-access/api';
import { isTestApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export interface SignInProps {
  onSuccess: () => void;
}

export function SignIn(props: SignInProps): ReactElement {
  const { onSuccess } = props;
  const translate = useTranslation('AUTH.SIGN_IN');
  const [apiUrlInput, setApiUrlInput] = useState<string>();
  const [providers, setProviders] = useState<Array<Provider>>([]);

  const showGoogleSignIn = !isTestApiUrl(apiUrlInput) && providers.includes(Provider.GOOGLE);
  const showOidcSignIn = !isTestApiUrl(apiUrlInput) && providers.includes(Provider.OIDC);

  const handleSuccess = (): void => {
    onSuccess();
    setTimeout(() => {
      ToastService.showSuccess(translate('TEXT_YOU_LOGGED_IN'));
    }, 250);
  };

  return (
    <View className='flex-1 pt-32'>
      <View className='mb-12'>
        <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{translate('TEXT_TITLE_EXTERNAL')}</AppText>
      </View>
      <EmailSignInForm
        onSuccess={handleSuccess}
        onApiUrlChange={(url) => setApiUrlInput(url)}
        setOauthProviders={setProviders}
      />
      {showGoogleSignIn && (
        <View className='pt-40'>
          <GoogleSignInForm onSuccess={handleSuccess} />
        </View>
      )}
      {showOidcSignIn && (
        <View className='pt-40'>
          <OdicSignIn />
        </View>
      )}
    </View>
  );
}
