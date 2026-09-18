import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { Linking } from 'react-native';
import { EmailSignInForm } from '@open-webui-react-native/mobile/auth/features/email-sign-in-form';
import { GoogleSignInForm } from '@open-webui-react-native/mobile/auth/features/google-sign-in-form';
import { OdicSignIn } from '@open-webui-react-native/mobile/auth/features/odic-sign-in';
import { AppPressable, AppSafeAreaView, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider } from '@open-webui-react-native/shared/data-access/api';
import { constants, isTestApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export interface SignInProps {
  onSuccess: () => void;
}

export function SignIn(props: SignInProps): ReactElement {
  const { onSuccess } = props;
  const translate = useTranslation('AUTH.SIGN_IN');
  const [apiUrlInput, setApiUrlInput] = useState<string>();
  const [providers, setProviders] = useState<Partial<Record<Provider, string>>>({});

  const showGoogleSignIn = !isTestApiUrl(apiUrlInput) && Provider.GOOGLE in providers;
  const showOidcSignIn = !isTestApiUrl(apiUrlInput) && Provider.OIDC in providers;

  const handleSuccess = (): void => {
    onSuccess();
    setTimeout(() => {
      ToastService.showSuccess(translate('TEXT_YOU_LOGGED_IN'));
    }, 250);
  };

  const handleSupportPress = async (): Promise<void> => {
    const mailUrl = `mailto:${constants.supportEmail}`;

    try {
      const canOpenMailUrl = await Linking.canOpenURL(mailUrl);

      if (canOpenMailUrl) {
        await Linking.openURL(mailUrl);
      }
    } catch {
      ToastService.showError(translate('TEXT_NO_EMAIL_APP_FOUND', { email: constants.supportEmail }));
    }
  };

  return (
    <AppSafeAreaView edges={['bottom']} className='flex-1 pt-32'>
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
          <OdicSignIn providerName={providers[Provider.OIDC] || 'SSO'} onSuccess={handleSuccess} />
        </View>
      )}
      <View className='mt-auto pt-40 pb-16 gap-4'>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
          {translate('TEXT_NEED_HELP_OR_FEEDBACK')}
        </AppText>
        <AppPressable
          className='self-center'
          onPress={handleSupportPress}
          hitSlop={12}>
          <AppText className='text-sm-sm sm:text-sm text-brand-primary text-center'>
            {translate('TEXT_EMAIL_RONAS_IT')}
          </AppText>
        </AppPressable>
      </View>
    </AppSafeAreaView>
  );
}
