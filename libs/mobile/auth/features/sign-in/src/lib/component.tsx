import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { Linking } from 'react-native';
import { EmailSignInForm } from '@open-webui-react-native/mobile/auth/features/email-sign-in-form';
import { OauthSignIn } from '@open-webui-react-native/mobile/auth/features/oauth-sign-in';
import { AppPressable, AppSafeAreaView, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { Provider, supportedOauthProviders } from '@open-webui-react-native/shared/data-access/api';
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

  const oauthProviders = isTestApiUrl(apiUrlInput)
    ? []
    : supportedOauthProviders.filter((provider) => provider in providers);

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

  // TODO: Remove `sign-in-screen` testID once real e2e tests are written, it is only for the CI smoke test
  return (
    <AppSafeAreaView testID='sign-in-screen' edges={['bottom']} className='flex-1 pt-32'>
      <View className='mb-12'>
        <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{translate('TEXT_TITLE_EXTERNAL')}</AppText>
      </View>
      <EmailSignInForm
        onSuccess={handleSuccess}
        onApiUrlChange={(url) => setApiUrlInput(url)}
        setOauthProviders={setProviders}
      />
      {oauthProviders.map((provider) => (
        <View key={provider} className='pt-40'>
          <OauthSignIn provider={provider} providerName={providers[provider]} onSuccess={handleSuccess} />
        </View>
      ))}
      <View className='mt-auto pt-40 pb-16 gap-4'>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
          {translate('TEXT_NEED_HELP_OR_FEEDBACK')}
        </AppText>
        <AppPressable className='self-center' onPress={handleSupportPress} hitSlop={12}>
          <AppText className='text-sm-sm sm:text-sm text-brand-primary text-center'>
            {translate('TEXT_EMAIL_RONAS_IT')}
          </AppText>
        </AppPressable>
      </View>
    </AppSafeAreaView>
  );
}
