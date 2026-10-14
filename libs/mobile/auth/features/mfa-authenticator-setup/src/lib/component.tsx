import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from '@legendapp/state/react';
import { i18n, useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { Fragment, ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { SvgXml } from 'react-native-svg';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { MfaLayout } from '@open-webui-react-native/mobile/auth/ui/mfa-layout';
import { MfaCodeFormSchema } from '@open-webui-react-native/mobile/auth/utils/mfa-form';
import {
  AppButton,
  AppPressable,
  AppSpinner,
  AppText,
  FormFloatedLabelInput,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ConfirmMfaEnrollmentRequest, mfaApi, mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { decodeQrCode } from './utils';

const qrCodeSize = 248;

export function MfaAuthenticatorSetup(): ReactElement {
  const translate = useTranslation('AUTH.MFA_AUTHENTICATOR_SETUP');
  const { openRecoveryCodes, backToSignIn, handleError } = useMfaNavigation();

  const challengeToken = useSelector(mfaState$.challengeToken);
  const {
    data: enrollment,
    isError: isEnrollmentError,
    isFetching: isEnrollmentFetching,
    refetch: refetchEnrollment,
  } = mfaApi.useStartEnrollment(challengeToken, handleError);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<MfaCodeFormSchema>({
    defaultValues: new MfaCodeFormSchema(),
    resolver: yupResolver(MfaCodeFormSchema.validationSchema),
  });

  const { mutateAsync, isPending } = mfaApi.useConfirmEnrollment();

  const submit = handleSubmit(async ({ code }) => {
    try {
      const response = await mutateAsync(new ConfirmMfaEnrollmentRequest({ challengeToken, code: code.trim() }));
      openRecoveryCodes(response.token, response.recoveryCodes ?? []);
    } catch (error) {
      handleError(error);
    }
  });

  const handleCopyKey = async (): Promise<void> => {
    if (enrollment) {
      await Clipboard.setStringAsync(enrollment.manualKey);
      ToastService.showSuccess(i18n.t('SHARED.COMMON.TEXT_COPIED_TO_CLIPBOARD'));
    }
  };

  return (
    <MfaLayout title={translate('TEXT_TITLE')} description={translate('TEXT_DESCRIPTION')}>
      <View className='items-center gap-12'>
        {enrollment ? (
          <View className='items-center gap-12 w-full'>
            <View className='bg-white p-8 rounded-xl'>
              <SvgXml
                xml={decodeQrCode(enrollment.qrCode)}
                width={qrCodeSize}
                height={qrCodeSize} />
            </View>
            <AppPressable
              className='w-full gap-4'
              onPress={handleCopyKey}
              hitSlop={8}>
              <AppText className='text-md-sm sm:text-md text-center uppercase'>{enrollment.manualKey}</AppText>
              <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
                {translate('TEXT_TAP_TO_COPY_KEY')}
              </AppText>
            </AppPressable>
          </View>
        ) : (
          <View className='justify-center gap-12 w-full' style={{ height: qrCodeSize }}>
            {isEnrollmentError ? (
              <Fragment>
                <AppText className='text-md-sm sm:text-md text-center'>{translate('TEXT_FAILED_TO_LOAD_KEY')}</AppText>
                <AppButton
                  text={translate('BUTTON_TRY_AGAIN')}
                  variant='outline'
                  isLoading={isEnrollmentFetching}
                  onPress={() => refetchEnrollment()}
                />
              </Fragment>
            ) : (
              <AppSpinner />
            )}
          </View>
        )}
      </View>
      <FormFloatedLabelInput
        name='code'
        control={control}
        label={translate('TEXT_AUTHENTICATOR_CODE')}
        keyboardType='number-pad'
        textContentType='oneTimeCode'
        autoComplete='one-time-code'
        returnKeyType='done'
        onSubmitEditing={submit}
      />
      <AppButton
        text={translate('BUTTON_CONTINUE')}
        disabled={!isValid || !enrollment}
        isLoading={isPending}
        onPress={submit}
      />
      <AppButton
        text={translate('BUTTON_BACK_TO_SIGN_IN')}
        variant='ghost'
        onPress={backToSignIn} />
    </MfaLayout>
  );
}
