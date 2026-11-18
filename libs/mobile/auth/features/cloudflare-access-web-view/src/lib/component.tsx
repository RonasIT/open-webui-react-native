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
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

export interface CloudflareAccessWebViewProps {
  isVisible: boolean;
  serverUrl: string;
  onClose: () => void;
  onAccessPass: (accessPass: string) => void;
}

const accessPassReadAttempts = 6;
const accessPassReadInterval = 500;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// NOTE: A normal WebView on the default store: incognito or a disabled cache on iOS hides the cookie from native code.
export function CloudflareAccessWebView({
  isVisible,
  serverUrl,
  onClose,
  onAccessPass,
}: CloudflareAccessWebViewProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.CLOUDFLARE_ACCESS_WEB_VIEW');
  const isAccessPassTaken = useRef(false);
  const isReadingAccessPass = useRef(false);
  const isOnServer = useRef(false);
  const isOpen = useRef(false);
  const serverHost = getHost(serverUrl);

  const [isPageLoading, setIsPageLoading] = useState(true);
  // NOTE: Like the OAuth WebView, the spinner is hidden on the Access login page: Android may not end its load.
  const [isOnLoginPage, setIsOnLoginPage] = useState(false);

  // NOTE: The WebView store may write the cookie a moment after the page loads, so it is read a few times.
  // Reading stops early when the page leaves the server, e.g. on its way to the Access login page.
  const readAccessPass = async (): Promise<string | undefined> => {
    for (let attempt = 0; attempt < accessPassReadAttempts; attempt++) {
      const accessPass = await cookieService.getAccessPass(serverUrl);

      if (accessPass || !isOnServer.current || !isOpen.current) {
        return accessPass;
      }

      await wait(accessPassReadInterval);
    }
  };

  // NOTE: Sign-in is done once the page is back on the server host and `CF_Authorization` is in the store.
  const handleNavigationStateChange = async ({ url, loading }: WebViewNavigation): Promise<void> => {
    isOnServer.current = getHost(url) === serverHost;
    setIsOnLoginPage(!isOnServer.current);

    if (loading || !isOnServer.current || isAccessPassTaken.current || isReadingAccessPass.current) {
      return;
    }

    isReadingAccessPass.current = true;
    const accessPass = await readAccessPass();
    isReadingAccessPass.current = false;

    if (isAccessPassTaken.current || !isOnServer.current || !isOpen.current) {
      return;
    }

    // NOTE: The server page opened without a pass, e.g. Access was turned off: nothing more will come.
    if (!accessPass) {
      ToastService.showError(translate('TEXT_ACCESS_PASS_NOT_RECEIVED'));
      onClose();

      return;
    }

    isAccessPassTaken.current = true;
    await cookieService.clearAccessPass(serverUrl);
    onAccessPass(accessPass);
  };

  useEffect(() => {
    isOpen.current = isVisible;

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
              // NOTE: A cached server page would open without reaching Access, so no pass is ever set.
              source={{ uri: serverUrl, headers: { 'Cache-Control': 'no-cache' } }}
              cacheMode='LOAD_NO_CACHE'
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
