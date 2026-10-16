import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { HttpStatusCode } from 'axios';
import { Fragment, ReactElement, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { AppButton, AppText, View, FormFloatedLabelInput } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import {
  appConfigurationApi,
  authApi,
  Provider,
  supportedOauthProviders,
} from '@open-webui-react-native/shared/data-access/api';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { normalizeServerUrl, resolveApiUrl } from '@open-webui-react-native/shared/utils/config';
import { useDebouncedQuery } from '@open-webui-react-native/shared/utils/use-debounced-query';
import { UrlInputLoader } from './components';
import { emailFormConfig } from './config';
import { EmailFormSchema } from './forms';

interface EmailSignInFormProps {
  onSuccess: () => void;
  onApiUrlChange?: (url: string) => void;
  setOauthProviders: (providers: Partial<Record<Provider, string>>) => void;
}

export function EmailSignInForm({ onSuccess, onApiUrlChange, setOauthProviders }: EmailSignInFormProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.EMAIL_FORM');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ initialValue: appStorageService.apiUrl.get() });
  const queryRef = useRef(query);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<EmailFormSchema>({
    defaultValues: new EmailFormSchema(),
    resolver: yupResolver(EmailFormSchema.validationSchema),
  });

  const {
    fetchWithUrlResult: config,
    fetchWithUrl,
    isFetchWithUrlLoading,
    isFetchWithUrlSuccess,
    isFetchWithUrlError,
    fetchWithUrlError,
  } = appConfigurationApi.useGetAppConfiguration({ enabled: false });
  const { mutate, isPending } = authApi.useSignInWithEmailPassword({ onSuccess });

  const serverUrl = normalizeServerUrl(debouncedQuery);
  const isUrlValid = !errors.url && !!serverUrl && normalizeServerUrl(query) === serverUrl;

  const isUrlWithConfig = isFetchWithUrlSuccess && !!(config?.name && config?.version);
  const isUrlWithoutConfig = isFetchWithUrlSuccess && !(config?.name && config?.version);

  const isAuthEnabled = config?.features?.auth !== false;
  const isLdapEnabled = !!config?.features?.enableLdap;
  const isLoginFormEnabled = config?.features?.enableLoginForm !== false;
  const isLoginFormRequired = isAuthEnabled && isLoginFormEnabled;
  const hasOauthProviders = Object.keys(config?.oauth?.providers || {}).length > 0;
  const hasSupportedOauthProviders = supportedOauthProviders.some(
    (provider) => provider in (config?.oauth?.providers || {}),
  );

  const showSignInButton = !isAuthEnabled || isLoginFormEnabled;
  const showMisconfigurationMessage =
    isUrlWithConfig && isAuthEnabled && !isLoginFormEnabled && !hasOauthProviders && !isLdapEnabled;
  const showUnsupportedProviderMessage =
    isUrlWithConfig &&
    isAuthEnabled &&
    !isLoginFormEnabled &&
    !hasSupportedOauthProviders &&
    (hasOauthProviders || isLdapEnabled);

  const isFormValid = (!isLoginFormRequired || isValid) && isUrlValid && isUrlWithConfig;

  const onSubmit = (form: FormValues<EmailFormSchema>): void => {
    mutate({ email: form.email, password: form.password });
  };

  const signInWithoutAuth = (): void => {
    mutate({ email: '', password: '' });
  };

  const checkServerUrl = async (): Promise<void> => {
    if (!isUrlValid) {
      return;
    }

    setOauthProviders({});

    const checkedConfig = await fetchWithUrl(resolveApiUrl(serverUrl));
    const isInputStillChecked = normalizeServerUrl(queryRef.current) === serverUrl;

    if (!isInputStillChecked || !checkedConfig?.name || !checkedConfig?.version) {
      return;
    }

    appStorageService.apiUrl.set(serverUrl);
    setOauthProviders(checkedConfig.oauth?.providers ?? {});
  };

  const getUrlCheckErrorText = (): string | undefined => {
    if (!isUrlValid || isFetchWithUrlLoading) {
      return;
    }

    const responseStatus = fetchWithUrlError?.response?.status;

    if (isFetchWithUrlError && (!responseStatus || responseStatus >= HttpStatusCode.InternalServerError)) {
      return translate('TEXT_SERVER_UNREACHABLE');
    }

    if (isFetchWithUrlError || isUrlWithoutConfig) {
      return translate('TEXT_NOT_OPEN_WEBUI_SERVER');
    }
  };

  useEffect(() => {
    queryRef.current = query;
    setValue('url', query, { shouldValidate: true });
    onApiUrlChange?.(query);

    if (normalizeServerUrl(query) !== serverUrl) {
      setOauthProviders({});
    }
  }, [query]);

  useEffect(() => {
    checkServerUrl();
  }, [serverUrl, isUrlValid]);

  return (
    <View className='w-full gap-8'>
      <FormFloatedLabelInput
        name='url'
        testID='sign-in-api-url'
        control={control}
        value={query}
        onChangeText={setQuery}
        autoCapitalize='none'
        autoCorrect={false}
        secureTextEntry={false}
        returnKeyType='next'
        keyboardType='url'
        placeholder={emailFormConfig.apiUrlPlaceholder}
        label={translate('TEXT_API_URL')}
        onSubmitEditing={() => emailRef.current?.focus()}
        enablesReturnKeyAutomatically={true}
        accessoryRight={
          isUrlValid ? (
            <UrlInputLoader
              isLoading={isFetchWithUrlLoading}
              isSuccess={isUrlWithConfig}
              isError={isFetchWithUrlError || isUrlWithoutConfig}
              retryLabel={translate('BUTTON_RETRY_SERVER_CHECK')}
              onRetry={checkServerUrl}
            />
          ) : undefined
        }
        error={errors.url?.message ?? getUrlCheckErrorText()}
        helperText={
          isUrlValid && isUrlWithConfig && !isFetchWithUrlLoading ? `${config?.name} ${config?.version}` : undefined
        }
      />
      {isLoginFormRequired && (
        <Fragment>
          <FormFloatedLabelInput
            inputRef={emailRef}
            name='email'
            testID='sign-in-email'
            control={control}
            autoCapitalize='none'
            autoCorrect={false}
            secureTextEntry={false}
            returnKeyType='next'
            keyboardType='email-address'
            placeholder={emailFormConfig.emailPlaceholder}
            label={translate('TEXT_EMAIL_ADDRESS')}
            onSubmitEditing={() => passwordRef.current?.focus()}
            enablesReturnKeyAutomatically={true}
          />
          <FormFloatedLabelInput
            name='password'
            testID='sign-in-password'
            control={control}
            inputRef={passwordRef}
            autoCapitalize='none'
            autoCorrect={false}
            returnKeyType='done'
            placeholder={translate('TEXT_ENTER_YOUR_PASSWORD')}
            label={translate('TEXT_PASSWORD')}
            isPassword
          />
        </Fragment>
      )}
      {showMisconfigurationMessage && (
        <AppText className='text-sm-sm sm:text-sm text-status-danger text-center'>
          {translate('TEXT_SSO_MISCONFIGURED')}
        </AppText>
      )}
      {showUnsupportedProviderMessage && (
        <AppText className='text-sm-sm sm:text-sm text-status-danger text-center'>
          {translate('TEXT_SSO_PROVIDER_NOT_SUPPORTED')}
        </AppText>
      )}
      {showSignInButton && (
        <AppButton
          text={translate('BUTTON_SIGN_IN')}
          testID='sign-in-submit'
          disabled={!isFormValid}
          isLoading={isPending}
          className='mt-16'
          onPress={isLoginFormRequired ? handleSubmit(onSubmit) : signInWithoutAuth}
        />
      )}
    </View>
  );
}
