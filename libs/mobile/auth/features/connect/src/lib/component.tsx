import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { HttpStatusCode } from 'axios';
import { ReactElement, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CloudflareAccessWebView } from '@open-webui-react-native/mobile/auth/features/cloudflare-access-web-view';
import { SupportLink } from '@open-webui-react-native/mobile/auth/ui/support-link';
import {
  AppButton,
  AppSafeAreaView,
  AppText,
  FormFloatedLabelInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { appConfigurationApi, authApi, SignInResponse } from '@open-webui-react-native/shared/data-access/api';
import { isCloudflareAccessError } from '@open-webui-react-native/shared/data-access/api-client';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { normalizeServerUrl, resolveApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { ConnectFormSchema } from './forms';
import { hasSupportedSignIn } from './utils';

const apiUrlPlaceholder = 'https://someurl.com/api';

export interface ConnectProps {
  onContinue: () => void;
  onSignIn: () => void;
}

export function Connect({ onContinue, onSignIn }: ConnectProps): ReactElement {
  const translate = useTranslation('AUTH.CONNECT');

  const [isAccessWebViewVisible, setIsAccessWebViewVisible] = useState(false);
  // NOTE: Results are shown only for the address checked by "Continue" here, not for one cached from earlier.
  const [checkedApiUrl, setCheckedApiUrl] = useState<string>();

  const {
    control,
    getValues,
    formState: { isValid, errors },
  } = useForm<ConnectFormSchema>({
    defaultValues: new ConnectFormSchema({ url: appStorageService.apiUrl.get() ?? '' }),
    resolver: yupResolver(ConnectFormSchema.validationSchema),
    mode: 'onChange',
  });
  const url = useWatch({ control, name: 'url' });

  const serverUrl = normalizeServerUrl(url);
  const apiUrl = resolveApiUrl(serverUrl);

  const {
    data: config,
    error,
    fetchStatus,
    refetch,
  } = appConfigurationApi.useGetServerConfiguration(apiUrl, { enabled: false });
  const { mutate: signIn, isPending: isSigningIn } = authApi.useSignInWithEmailPassword({});

  // NOTE: Offline the check is paused rather than failed, so the field stays locked until it ends.
  const isChecking = fetchStatus !== 'idle';
  const isChecked = checkedApiUrl === apiUrl && !isChecking;
  const isAccessRequired = isChecked && isCloudflareAccessError(error);
  const isContinueDisabled = !isValid || !serverUrl;

  const handleSignInWithoutAuth = (response: SignInResponse): void => {
    if (!response.token) {
      return;
    }

    onSignIn();
    setTimeout(() => ToastService.showSuccess(translate('TEXT_YOU_LOGGED_IN')), 250);
  };

  // NOTE: The check runs only here, never while the address is typed.
  const handleContinue = async (isAfterAccessPass?: boolean): Promise<void> => {
    if (isContinueDisabled) {
      return;
    }

    setCheckedApiUrl(apiUrl);
    const result = await refetch();

    if (normalizeServerUrl(getValues('url')) !== serverUrl) {
      return;
    }

    if (isCloudflareAccessError(result.error)) {
      setIsAccessWebViewVisible(true);

      return;
    }

    if (result.isError || !result.data?.name || !result.data.version) {
      return;
    }

    // NOTE: Saving another server drops a pass issued for a different one, so coming back asks for Access again.
    if (authState$.accessPass.get() && authState$.accessPass.serverUrl.get() !== apiUrl) {
      authState$.clearAccessPass();
    }

    appStorageService.apiUrl.set(serverUrl);

    if (!hasSupportedSignIn(result.data)) {
      return;
    }

    if (isAfterAccessPass) {
      ToastService.showSuccess(translate('TEXT_SIGNED_IN_TO_CLOUDFLARE_ACCESS'));
    }

    if (result.data.features?.auth === false) {
      signIn({ email: '', password: '' }, { onSuccess: handleSignInWithoutAuth });

      return;
    }

    onContinue();
  };

  const handleAccessPass = (value: string): void => {
    setIsAccessWebViewVisible(false);
    authState$.setAccessPass({ serverUrl: apiUrl, value });
    handleContinue(true);
  };

  const getErrorText = (): string | undefined => {
    if (errors.url) {
      return errors.url.message;
    }

    if (!isChecked || isAccessRequired) {
      return;
    }

    if (error) {
      const responseStatus = error.response?.status;

      return !responseStatus || responseStatus >= HttpStatusCode.InternalServerError
        ? translate('TEXT_SERVER_UNREACHABLE')
        : translate('TEXT_NOT_OPEN_WEBUI_SERVER');
    }

    if (!config) {
      return;
    }

    if (!config.name || !config.version) {
      return translate('TEXT_NOT_OPEN_WEBUI_SERVER');
    }

    if (hasSupportedSignIn(config)) {
      return;
    }

    const hasOtherSignIn = Boolean(config.features?.enableLdap) || Object.keys(config.oauth?.providers ?? {}).length > 0;

    return hasOtherSignIn ? translate('TEXT_SSO_PROVIDER_NOT_SUPPORTED') : translate('TEXT_SSO_MISCONFIGURED');
  };

  return (
    <AppSafeAreaView
      testID='connect-screen'
      edges={['bottom']}
      className='flex-1 pt-32'>
      <View className='mb-12'>
        <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{translate('TEXT_TITLE')}</AppText>
      </View>
      <View className='w-full gap-8'>
        <FormFloatedLabelInput
          name='url'
          testID='connect-api-url'
          control={control}
          editable={!isChecking && !isSigningIn}
          autoCapitalize='none'
          autoCorrect={false}
          secureTextEntry={false}
          returnKeyType='go'
          keyboardType='url'
          placeholder={apiUrlPlaceholder}
          label={translate('TEXT_API_URL')}
          onSubmitEditing={() => handleContinue()}
          enablesReturnKeyAutomatically={true}
          error={getErrorText()}
          helperText={isAccessRequired ? translate('TEXT_PROTECTED_BY_CLOUDFLARE_ACCESS') : undefined}
        />
        <AppButton
          text={translate('BUTTON_CONTINUE')}
          testID='connect-continue'
          disabled={isContinueDisabled}
          isLoading={isChecking || isSigningIn}
          className='mt-16'
          onPress={() => handleContinue()}
        />
      </View>
      <SupportLink />
      <CloudflareAccessWebView
        isVisible={isAccessWebViewVisible}
        serverUrl={apiUrl}
        onClose={() => setIsAccessWebViewVisible(false)}
        onAccessPass={handleAccessPass}
      />
    </AppSafeAreaView>
  );
}
