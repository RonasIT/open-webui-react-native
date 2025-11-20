import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import {
  AppButton,
  View,
  FormFloatedLabelInput,
} from '@open-web-ui-mobile-client-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-web-ui-mobile-client-react-native/mobile/shared/utils/form';
import { appConfigurationApi, authApi } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';
import { FeatureID, isFeatureEnabled } from '@open-web-ui-mobile-client-react-native/shared/utils/feature-flag';
import { useDebouncedQuery } from '@open-web-ui-mobile-client-react-native/shared/utils/use-debounced-query';
import { UrlInputLoader } from './components';
import { emailFormConfig } from './config';
import { EmailFormSchema } from './forms';

interface EmailSignInFormProps {
  onSuccess: () => void;
}

export function EmailSignInForm({ onSuccess }: EmailSignInFormProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.EMAIL_FORM');
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const isApiUrlFeatureEnabled = isFeatureEnabled(FeatureID.API_URL);

  const { query, setQuery, debouncedQuery } = useDebouncedQuery({ initialValue: appStorageService.apiUrl.get() });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    defaultValues: new EmailFormSchema(),
    resolver: yupResolver(EmailFormSchema.validationSchema),
  });

  const {
    fetchWithUrlResult: config,
    fetchWithUrl,
    isFetchWithUrlLoading,
    isFetchWithUrlSuccess,
    isFetchWithUrlError,
  } = appConfigurationApi.useGetAppConfiguration({ enabled: false });
  const { mutate, isPending } = authApi.useSignInWithEmailPassword({ onSuccess });

  const isUrlValid = !errors.url && debouncedQuery.length !== 0 && query.length !== 0;

  const isUrlWithConfig = isFetchWithUrlSuccess && !!(config?.name && config?.version);
  const isUrlWithoutConfig = isFetchWithUrlSuccess && !(config?.name && config?.version);

  const isFormValid = isApiUrlFeatureEnabled ? isValid && isUrlValid && isUrlWithConfig : isValid;

  const onSubmit = (form: FormValues<EmailFormSchema>): void => {
    mutate({ email: form.email, password: form.password });
  };

  useEffect(() => {
    setValue('url', query, { shouldValidate: true });
  }, [query]);

  useEffect(() => {
    const refetchConfig = async (): Promise<void> => {
      if (isUrlValid) {
        const res = await fetchWithUrl(debouncedQuery);

        if (res?.name && res?.version) {
          appStorageService.apiUrl.set(debouncedQuery);
        }
      }
    };

    refetchConfig();
  }, [debouncedQuery]);

  return (
    <View className='w-full gap-8'>
      {isApiUrlFeatureEnabled && (
        <FormFloatedLabelInput
          name='url'
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
              />
            ) : undefined
          }
          helperText={
            isUrlValid && isUrlWithConfig && !isFetchWithUrlLoading ? `${config?.name} ${config?.version}` : undefined
          }
        />
      )}
      <FormFloatedLabelInput
        inputRef={emailRef}
        name='email'
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
        control={control}
        inputRef={passwordRef}
        autoCapitalize='none'
        autoCorrect={false}
        returnKeyType='done'
        placeholder={translate('TEXT_ENTER_YOUR_PASSWORD')}
        label={translate('TEXT_PASSWORD')}
        isPassword
      />
      <AppButton
        text={translate('BUTTON_SIGN_IN')}
        disabled={!isFormValid}
        isLoading={isPending}
        className='mt-16'
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
