import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { useQueryClient } from '@tanstack/react-query';
import { Fragment, ReactElement, useEffect, useRef, useState } from 'react';
import { CloudflareAccessWebView } from '@open-webui-react-native/mobile/auth/features/cloudflare-access-web-view';
import { useLogout } from '@open-webui-react-native/mobile/shared/features/use-logout';
import { AppBottomSheet, AppButton, AppText, Icon, View } from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { useBottomInset } from '@open-webui-react-native/mobile/shared/utils/use-bottom-inset';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { getAccessPassEmail } from './utils/get-access-pass-email';

export function AccessPassExpiredSheet(): ReactElement {
  const translate = useTranslation('AUTH.ACCESS_PASS_EXPIRED_SHEET');
  const queryClient = useQueryClient();
  const { logout } = useLogout();
  const bottomInset = useBottomInset();

  const isAccessPassExpired = useSelector(authState$.isAccessPassExpired);
  const sheetRef = useRef<BottomSheetModal>(null);
  const isPresented = useRef(false);
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
  // NOTE: Dismissing a modal that was never presented makes it skip the next present, so only a shown sheet is dismissed.
  useEffect(() => {
    if (isAccessPassExpired) {
      sheetRef.current?.present();
      isPresented.current = true;
    } else if (isPresented.current) {
      sheetRef.current?.dismiss();
      isPresented.current = false;
    }
  }, [isAccessPassExpired]);

  return (
    <Fragment>
      <AppBottomSheet
        ref={sheetRef}
        isDismissible={false}
        isScrollable
        snapPoints={['100%']}
        content={
          <View className='flex-1 gap-16 py-16' style={{ paddingBottom: bottomInset }}>
            <View className='flex-1 items-center justify-center gap-32 py-40'>
              <Icon
                name='sadFace'
                width={120}
                height={120}
                className='color-text-tertiary' />
              <View className='w-full gap-8'>
                <AppText className='text-h3-sm sm:text-h3 font-medium text-center'>{translate('TEXT_TITLE')}</AppText>
                <AppText className='text-md-sm sm:text-md text-center'>{translate('TEXT_DESCRIPTION')}</AppText>
              </View>
            </View>
            <AppButton
              text={translate('BUTTON_SIGN_IN')}
              variant='outline'
              onPress={() => setIsAccessWebViewVisible(true)} />
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
