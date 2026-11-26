import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { Fragment, ReactElement, useEffect, useRef, useState } from 'react';
import { CloudflareAccessWebView } from '@open-webui-react-native/mobile/auth/features/cloudflare-access-web-view';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import { AppBottomSheet, AppButton, AppText, SheetHeader, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { getAccessPassEmail } from './utils/get-access-pass-email';

export function AccessPassExpiredSheet(): ReactElement {
  const translate = useTranslation('AUTH.ACCESS_PASS_EXPIRED_SHEET');
  const queryClient = useQueryClient();
  const { logout } = useLogout();

  const isAccessPassExpired = useSelector(authState$.isAccessPassExpired);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [isAccessWebViewVisible, setIsAccessWebViewVisible] = useState(false);

  const serverUrl = getApiUrl();

  const handleSignOutPress = (): void => {
    setIsAccessWebViewVisible(false);
    logout({ shouldClearAccessPass: true });
  };

  // NOTE: A pass issued to another person must not continue this person's Open WebUI session. It is saved first,
  // so the sign-out request passes Access and ends the session on the server too.
  const handleAccessPass = (value: string): void => {
    const previousEmail = getAccessPassEmail(authState$.accessPass.value.get() ?? '');
    const isAnotherPerson = !!previousEmail && previousEmail !== getAccessPassEmail(value);

    setIsAccessWebViewVisible(false);
    authState$.setAccessPass({ serverUrl, value });

    if (isAnotherPerson) {
      handleSignOutPress();

      return;
    }

    authState$.isAccessPassExpired.set(false);
    queryClient.invalidateQueries();
  };

  // NOTE: The sheet follows the flag the api-client raises: concurrent 401s raise it once, any sign-out lowers it.
  useEffect(() => {
    if (isAccessPassExpired) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isAccessPassExpired]);

  return (
    <Fragment>
      <AppBottomSheet
        ref={sheetRef}
        isDismissible={false}
        content={
          <View className='gap-16'>
            <SheetHeader title={translate('TEXT_TITLE')} />
            <AppText className='text-sm-sm sm:text-sm text-text-secondary text-center'>
              {translate('TEXT_DESCRIPTION')}
            </AppText>
            <AppButton text={translate('BUTTON_SIGN_IN')} onPress={() => setIsAccessWebViewVisible(true)} />
            <AppButton
              text={translate('BUTTON_SIGN_OUT')}
              variant='outline'
              onPress={handleSignOutPress} />
          </View>
        }
      />
      <CloudflareAccessWebView
        isVisible={isAccessWebViewVisible}
        serverUrl={serverUrl}
        onClose={() => setIsAccessWebViewVisible(false)}
        onAccessPass={handleAccessPass}
      />
    </Fragment>
  );
}
