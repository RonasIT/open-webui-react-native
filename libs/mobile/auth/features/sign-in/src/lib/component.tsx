import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import Constants from 'expo-constants';
import { ReactElement } from 'react';
import { EmailSignInForm } from '@open-webui-react-native/mobile/auth/features/email-sign-in-form';
import { GoogleSignInForm } from '@open-webui-react-native/mobile/auth/features/google-sign-in-form';
import { AppText, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export interface SignInProps {
  onSuccess: () => void;
}

export function SignIn(props: SignInProps): ReactElement {
  const { onSuccess } = props;
  const translate = useTranslation('AUTH.SIGN_IN');

  const isInternalRelease = Constants.expoConfig?.extra?.isInternalRelease;

  const handleSuccess = (): void => {
    onSuccess();
    setTimeout(() => {
      ToastService.showSuccess(translate('TEXT_YOU_LOGGED_IN'));
    }, 250);
  };

  if (isInternalRelease) {
    return (
      <View className='flex-1'>
        <View className='absolute top-0 left-0 right-0 pt-32 pb-8 px-6 z-10'>
          <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{translate('TEXT_TITLE_INTERNAL')}</AppText>
          <AppText className='text-sm-sm sm:text-sm'>{translate('TEXT_TITLE_INTERNAL_SUBTITLE')}</AppText>
        </View>
        <View className='flex-1 justify-center items-center'>
          <View className='w-full max-w-sm'>
            <View className='items-center mb-24'>
              <AppText className='text-center'>{translate('TEXT_USE_YOUR_RONAS_IT')}</AppText>
              <AppText className='text-center'>{translate('TEXT_GOOGLE_ACCOUNT_TO_SIGN_IN')}</AppText>
            </View>
            <GoogleSignInForm onSuccess={handleSuccess} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 pt-32'>
      <View className='mb-12'>
        <AppText className='text-h2-sm sm:text-h2 font-medium mb-24'>{translate('TEXT_TITLE_EXTERNAL')}</AppText>
      </View>
      <EmailSignInForm onSuccess={handleSuccess} />
    </View>
  );
}
