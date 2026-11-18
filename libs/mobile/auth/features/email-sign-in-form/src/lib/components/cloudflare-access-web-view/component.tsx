import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { commonStyle } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppSafeAreaView,
  AppSpinner,
  AppText,
  FullScreenModal,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { getHost } from '@open-webui-react-native/shared/utils/config';

export interface CloudflareAccessWebViewProps {
  isVisible: boolean;
  serverUrl: string;
  onClose: () => void;
  onAccessPass: (accessPass: string) => void;
}

// NOTE: A normal WebView on the default store: incognito or a disabled cache on iOS hides the cookie from native code.
export function CloudflareAccessWebView({
  isVisible,
  serverUrl,
  onClose,
  onAccessPass,
}: CloudflareAccessWebViewProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.CLOUDFLARE_ACCESS_WEB_VIEW');
  const isAccessPassTaken = useRef(false);
  const serverHost = getHost(serverUrl);

  const [isPageLoading, setIsPageLoading] = useState(true);
  // NOTE: Like the OAuth WebView, the spinner is hidden on the Access login page: Android may not end its load.
  const [isOnLoginPage, setIsOnLoginPage] = useState(false);

  // NOTE: Sign-in is done once the page is back on the server host and `CF_Authorization` is in the store.
  const handleNavigationStateChange = async ({ url, loading }: WebViewNavigation): Promise<void> => {
    const isOnServer = getHost(url) === serverHost;
    setIsOnLoginPage(!isOnServer);

    if (loading || !isOnServer || isAccessPassTaken.current) {
      return;
    }

    const accessPass = await cookieService.getAccessPass(serverUrl);

    if (!accessPass || isAccessPassTaken.current) {
      return;
    }

    isAccessPassTaken.current = true;
    await cookieService.clearAccessPass(serverUrl);
    onAccessPass(accessPass);
  };

  useEffect(() => {
    if (isVisible) {
      isAccessPassTaken.current = false;
      setIsPageLoading(true);
      setIsOnLoginPage(false);
    }
  }, [isVisible]);

  return (
    <FullScreenModal isVisible={isVisible}>
      <AppSafeAreaView edges={['top']} className='flex-1 bg-background-primary'>
        <View className='flex-row justify-end px-16 py-12'>
          <AppPressable onPress={onClose} hitSlop={12}>
            <AppText>{translate('BUTTON_CLOSE')}</AppText>
          </AppPressable>
        </View>
        <View className='h-full'>
          {isPageLoading && !isOnLoginPage && <AppSpinner size='large' isFullScreen />}
          {isVisible && (
            <WebView
              source={{ uri: serverUrl }}
              style={commonStyle.fullFlex}
              onLoadStart={() => setIsPageLoading(true)}
              onLoadEnd={() => setIsPageLoading(false)}
              onNavigationStateChange={handleNavigationStateChange}
            />
          )}
        </View>
      </AppSafeAreaView>
    </FullScreenModal>
  );
}
