import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { EmailSignInForm } from '@open-webui-react-native/mobile/auth/features/email-sign-in-form';
import { OauthSignIn } from '@open-webui-react-native/mobile/auth/features/oauth-sign-in';
import { SupportLink } from '@open-webui-react-native/mobile/auth/ui/support-link';
import { AppSafeAreaView, AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appConfigurationApi, supportedOauthProviders } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getHost, isTestApiUrl, resolveApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export interface SignInProps {
  onSuccess: () => void;
}

// NOTE: Opens only after the connect screen has checked and saved the server, so its config is in the cache.
export function SignIn({ onSuccess }: SignInProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN');

  const serverUrl = appStorageService.apiUrl.get() ?? '';
  const apiUrl = resolveApiUrl(serverUrl);
  const { data: config } = appConfigurationApi.useGetServerConfiguration(apiUrl);
  const accessPassServerUrl = useSelector(authState$.accessPass.serverUrl);

  const providers = config?.oauth?.providers ?? {};
  const oauthProviders = isTestApiUrl(serverUrl)
    ? []
    : supportedOauthProviders.filter((provider) => provider in providers);
  const isLoginFormEnabled = config?.features?.enableLoginForm !== false;

  const server = config ? `${getHost(serverUrl)} · ${config.name} ${config.version}` : getHost(serverUrl);
  const subtitle =
    accessPassServerUrl === apiUrl ? translate('TEXT_SERVER_VIA_CLOUDFLARE_ACCESS', { server }) : server;

  const handleSuccess = (): void => {
    onSuccess();
    setTimeout(() => {
      ToastService.showSuccess(translate('TEXT_YOU_LOGGED_IN'));
    }, 250);
  };

  return (
    <AppSafeAreaView
      testID='sign-in-screen'
      edges={['bottom']}
      className='flex-1 pt-32'>
      <View className='mb-12 gap-8'>
        <AppText className='text-h2-sm sm:text-h2 font-medium'>{translate('TEXT_TITLE_EXTERNAL')}</AppText>
        <AppText testID='sign-in-server' className='text-sm-sm sm:text-sm text-text-secondary mb-24'>
          {subtitle}
        </AppText>
      </View>
      {isLoginFormEnabled && <EmailSignInForm onSuccess={handleSuccess} />}
      {oauthProviders.map((provider) => (
        <View key={provider} className='pt-40'>
          <OauthSignIn
            provider={provider}
            providerName={providers[provider]}
            onSuccess={handleSuccess} />
        </View>
      ))}
      <SupportLink />
    </AppSafeAreaView>
  );
}
