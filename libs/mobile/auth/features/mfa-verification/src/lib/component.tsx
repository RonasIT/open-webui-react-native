import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { MfaLayout } from '@open-webui-react-native/mobile/auth/ui/mfa-layout';
import { AppButton, FormFloatedLabelInput } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { VerifyMfaRequest, mfaApi, mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { VerificationFormSchema } from './forms';

export function MfaVerification(): ReactElement {
  const translate = useTranslation('AUTH.MFA_VERIFICATION');
  const { completeSignIn, backToSignIn, handleError } = useMfaNavigation();

  const challengeToken = useSelector(mfaState$.challengeToken);

  const [isRecoveryCode, setIsRecoveryCode] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<VerificationFormSchema>({
    defaultValues: new VerificationFormSchema(),
    resolver: yupResolver(VerificationFormSchema.validationSchema),
  });

  const { mutateAsync, isPending } = mfaApi.useVerify();

  const submit = handleSubmit(async ({ code }) => {
    try {
      const response = await mutateAsync(
        new VerifyMfaRequest({ challengeToken, code: code.trim(), recovery: isRecoveryCode }),
      );
      completeSignIn(response.token);
    } catch (error) {
      handleError(error);
    }
  });

  const handleToggleRecoveryCode = (): void => {
    setIsRecoveryCode(!isRecoveryCode);
    reset();
  };

  return (
    <MfaLayout
      title={translate('TEXT_TITLE')}
      description={translate(isRecoveryCode ? 'TEXT_RECOVERY_CODE_DESCRIPTION' : 'TEXT_DESCRIPTION')}>
      <FormFloatedLabelInput
        // Remount to switch the keyboard type and keep the focus.
        key={String(isRecoveryCode)}
        name='code'
        control={control}
        label={translate(isRecoveryCode ? 'TEXT_RECOVERY_CODE' : 'TEXT_AUTHENTICATOR_CODE')}
        keyboardType={isRecoveryCode ? 'default' : 'number-pad'}
        textContentType='oneTimeCode'
        autoComplete='one-time-code'
        autoCapitalize='none'
        autoCorrect={false}
        autoFocus
      />
      <AppButton
        text={translate('BUTTON_CONTINUE')}
        disabled={!isValid}
        isLoading={isPending}
        onPress={submit} />
      <AppButton
        text={translate(isRecoveryCode ? 'BUTTON_USE_AUTHENTICATOR_CODE' : 'BUTTON_USE_RECOVERY_CODE')}
        variant='ghost'
        onPress={handleToggleRecoveryCode}
      />
      <AppButton
        text={translate('BUTTON_BACK_TO_SIGN_IN')}
        variant='ghost'
        onPress={backToSignIn} />
    </MfaLayout>
  );
}
