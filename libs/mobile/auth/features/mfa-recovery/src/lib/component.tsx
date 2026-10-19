import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { MfaLayout } from '@open-webui-react-native/mobile/auth/ui/mfa-layout';
import { AppButton, FormFloatedLabelInput } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { RecoverMfaRequest, mfaApi, mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { RecoveryFormSchema } from './forms';

export function MfaRecovery(): ReactElement {
  const translate = useTranslation('AUTH.MFA_RECOVERY');
  const { openStep, backToSignIn, handleError } = useMfaNavigation();

  const challengeToken = useSelector(mfaState$.challengeToken);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RecoveryFormSchema>({
    defaultValues: new RecoveryFormSchema(),
    resolver: yupResolver(RecoveryFormSchema.validationSchema),
  });

  const { mutateAsync, isPending } = mfaApi.useRecover();

  const submit = handleSubmit(async ({ resetToken }) => {
    try {
      const challenge = await mutateAsync(new RecoverMfaRequest({ challengeToken, resetToken: resetToken.trim() }));
      openStep(challenge, true);
    } catch (error) {
      handleError(error);
    }
  });

  return (
    <MfaLayout title={translate('TEXT_TITLE')} description={translate('TEXT_DESCRIPTION')}>
      <FormFloatedLabelInput
        name='resetToken'
        control={control}
        label={translate('TEXT_RECOVERY_TOKEN')}
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
        text={translate('BUTTON_BACK_TO_SIGN_IN')}
        variant='ghost'
        onPress={backToSignIn} />
    </MfaLayout>
  );
}
