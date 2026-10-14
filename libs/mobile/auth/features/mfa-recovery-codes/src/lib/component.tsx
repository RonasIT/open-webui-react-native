import { useSelector } from '@legendapp/state/react';
import { i18n, useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Clipboard from 'expo-clipboard';
import { ReactElement, useState } from 'react';
import { useMfaNavigation } from '@open-webui-react-native/mobile/auth/features/use-mfa-navigation';
import { MfaLayout } from '@open-webui-react-native/mobile/auth/ui/mfa-layout';
import { AppButton, AppPressable, AppText, Checkbox, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { mfaState$ } from '@open-webui-react-native/shared/data-access/api';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export function MfaRecoveryCodes(): ReactElement {
  const translate = useTranslation('AUTH.MFA.RECOVERY_CODES');
  const translateCommon = useTranslation('AUTH.MFA.COMMON');
  const { completeSignIn, backToSignIn } = useMfaNavigation();

  const recoveryCodes = useSelector(mfaState$.recoveryCodes) ?? [];
  const sessionToken = useSelector(mfaState$.sessionToken);

  const [isSaved, setIsSaved] = useState(false);

  const handleCopyCodes = async (): Promise<void> => {
    await Clipboard.setStringAsync(recoveryCodes.join('\n'));
    ToastService.showSuccess(i18n.t('SHARED.COMMON.TEXT_COPIED_TO_CLIPBOARD'));
  };

  const handleContinue = (): void => {
    if (sessionToken) {
      completeSignIn(sessionToken);
    }
  };

  return (
    <MfaLayout title={translate('TEXT_TITLE')} description={translate('TEXT_DESCRIPTION')}>
      <AppPressable className='gap-12' onPress={handleCopyCodes}>
        <View className='bg-background-secondary rounded-xl px-12 py-6'>
          <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_RECOVERY_CODES')}</AppText>
          <AppText className='text-md-sm sm:text-md'>{recoveryCodes.join('\n')}</AppText>
        </View>
        <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
          {translate('TEXT_TAP_TO_COPY_CODES')}
        </AppText>
      </AppPressable>
      <Checkbox
        isChecked={isSaved}
        label={translate('TEXT_I_HAVE_SAVED_CODES')}
        onPress={() => setIsSaved(!isSaved)} />
      <AppButton
        text={translateCommon('BUTTON_CONTINUE')}
        disabled={!isSaved}
        onPress={handleContinue} />
      <AppButton
        text={translateCommon('BUTTON_BACK_TO_SIGN_IN')}
        variant='ghost'
        onPress={backToSignIn} />
    </MfaLayout>
  );
}
