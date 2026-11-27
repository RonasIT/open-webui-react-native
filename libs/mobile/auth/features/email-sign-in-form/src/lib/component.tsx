import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'react-native';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { AppButton, View, FormFloatedLabelInput } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { FormValues } from '@open-webui-react-native/mobile/shared/utils/form';
import { authApi, MfaChallenge, MfaNextStep, SignInResponse } from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { emailFormConfig } from './config';
import { EmailFormSchema } from './forms';

interface EmailSignInFormProps {
  onSuccess: () => void;
}

export function EmailSignInForm({ onSuccess }: EmailSignInFormProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.EMAIL_FORM');
  const { openStep } = useMfaNavigation();
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<EmailFormSchema>({
    defaultValues: new EmailFormSchema(),
    resolver: yupResolver(EmailFormSchema.validationSchema),
  });

  const handleSignInSuccess = (response: SignInResponse): void => {
    if (response.nextStep === MfaNextStep.PENDING) {
      ToastService.showError(translate('TEXT_ACCOUNT_PENDING_APPROVAL'));

      return;
    }

    if (response.challengeToken && response.nextStep) {
      openStep(
        new MfaChallenge({
          nextStep: response.nextStep,
          challengeToken: response.challengeToken,
        }),
      );

      return;
    }

    if (response.token) {
      onSuccess();
    }
  };

  const { mutate, isPending } = authApi.useSignInWithEmailPassword({ onSuccess: handleSignInSuccess });

  const onSubmit = (form: FormValues<EmailFormSchema>): void => {
    mutate({ email: form.email, password: form.password });
  };

  return (
    <View className='w-full gap-8'>
      <FormFloatedLabelInput
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
      <AppButton
        text={translate('BUTTON_SIGN_IN')}
        testID='sign-in-submit'
        disabled={!isValid}
        isLoading={isPending}
        className='mt-16'
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}
