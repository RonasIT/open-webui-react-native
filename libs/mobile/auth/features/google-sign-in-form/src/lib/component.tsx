import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import Constants from 'expo-constants';
import { ReactElement, useState } from 'react';
import { AppButton } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authApi } from '@open-webui-react-native/shared/data-access/api';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';
import { ronasApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

GoogleSignin.configure({
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
});

interface GoogleSignInFormProps {
  onSuccess?: () => void;
}

export function GoogleSignInForm({ onSuccess }: GoogleSignInFormProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.GOOGLE_FORM');

  const { mutate: signInWithGoogle, isPending: isGoogleAuthRequestLoading } = authApi.useSignInWithGoogle({
    onSuccess,
  });
  const [isGoogleAuthProcessing, setIsGoogleAuthProcessing] = useState(false);

  const handleSignInWithGooglePress = async (): Promise<void> => {
    try {
      setIsGoogleAuthProcessing(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResponse = await GoogleSignin.signIn();
      const email = signInResponse.data?.user?.email;

      if (email) {
        appStorageService.apiUrl.set(ronasApiUrl);
        signInWithGoogle({ email, isProduction: appEnv.current === 'production' });
      } else if (signInResponse.type !== 'cancelled') {
        ToastService.showError();
      }
    } catch {
      ToastService.showError();
    } finally {
      setIsGoogleAuthProcessing(false);
    }
  };

  return (
    <AppButton
      text={translate('BUTTON_CONTINUE_WITH_GOOGLE')}
      iconName='googleLogo'
      onPress={handleSignInWithGooglePress}
      isLoading={isGoogleAuthProcessing || isGoogleAuthRequestLoading}
    />
  );
}
