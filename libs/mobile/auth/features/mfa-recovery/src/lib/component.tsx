import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { MfaLayout } from '@open-webui-react-native/mobile/auth/ui/mfa-layout';
import { MfaCodeFormSchema } from '@open-webui-react-native/mobile/auth/utils/mfa-form';
import { AppButton, FormFloatedLabelInput } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { RecoverMfaRequest, mfaApi, mfaState$ } from '@open-webui-react-native/shared/data-access/api';

export function MfaRecovery(): ReactElement {
  const translate = useTranslation('AUTH.MFA.RECOVERY');
  const translateCommon = useTranslation('AUTH.MFA.COMMON');
  const { openStep, backToSignIn, handleError } = useMfaNavigation();

  const challengeToken = useSelector(mfaState$.challengeToken);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<MfaCodeFormSchema>({
    defaultValues: new MfaCodeFormSchema(),
    resolver: yupResolver(MfaCodeFormSchema.validationSchema),
  });

  const { mutateAsync, isPending } = mfaApi.useRecover();

  const submit = handleSubmit(async ({ code }) => {
    try {
      const challenge = await mutateAsync(new RecoverMfaRequest({ challengeToken, resetToken: code.trim() }));
      openStep(challenge, true);
    } catch (error) {
      handleError(error);
    }
  });

  return (
    <MfaLayout title={translate('TEXT_TITLE')} description={translate('TEXT_DESCRIPTION')}>
      <FormFloatedLabelInput
        name='code'
        control={control}
        label={translate('TEXT_RECOVERY_TOKEN')}
        autoCapitalize='none'
        autoCorrect={false}
        autoFocus
        returnKeyType='done'
        onSubmitEditing={submit}
      />
      <AppButton
        text={translateCommon('BUTTON_CONTINUE')}
        disabled={!isValid}
        isLoading={isPending}
        onPress={submit} />
      <AppButton
        text={translateCommon('BUTTON_BACK_TO_SIGN_IN')}
        variant='ghost'
        onPress={backToSignIn} />
    </MfaLayout>
  );
}
