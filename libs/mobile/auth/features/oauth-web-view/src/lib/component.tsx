import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { commonStyle } from '@open-webui-react-native/mobile/shared/ui/styles';
import {
  AppPressable,
  AppSafeAreaView,
  AppSpinner,
  AppText,
  FullScreenModal,
  View,
} from '@open-webui-react-native/mobile/shared/ui/ui-kit';
import { authService, Provider } from '@open-webui-react-native/shared/data-access/api';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl, getHost } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { mobileUserAgent, tokenCaptureScript } from './script';

export type OauthWebViewProps = {
  isVisible: boolean;
  // Which provider flow to open — the only provider-specific bit. Everything else
  // (host detection, token capture, validation) is identical for every provider.
  provider: Provider;
  onClose: () => void;
  onGetToken: (token: string) => void;
};

export function OauthWebView({ isVisible, provider, onClose, onGetToken }: OauthWebViewProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OAUTH_WEB_VIEW_MODAL');
  const webViewRef = useRef<WebView>(null);
  const isTokenCaptured = useRef(false);

  const apiUrl = getApiUrl();
  const apiHost = getHost(apiUrl);

  const [isOnProvider, setIsOnProvider] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigationStateChange = (state: WebViewNavigation): void => {
    const onProvider = getHost(state.url) !== apiHost;
    setIsOnProvider(onProvider);

    if (!onProvider && !state.loading) {
      webViewRef.current?.injectJavaScript(tokenCaptureScript);
    }
  };

  const handleToken = async (token: string): Promise<void> => {
    try {
      setIsLoading(true);
      appStorageService.token.set(token);
      // We need to validate the token by calling getProfile.
      await authService.getProfile();
      onGetToken(token);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      ToastService.showError(translate('TEXT_THIS_SIGN_IN_METHOD_IS_UNAVAILABLE'));
      appStorageService.token.set(null);
      onClose();
    }
  };

  const handleMessage = (event: WebViewMessageEvent): void => {
    const payload = JSON.parse(event.nativeEvent.data);

    if (payload?.type === 'token' && payload.token && !isTokenCaptured.current) {
      isTokenCaptured.current = true;
      handleToken(payload.token);
    }
  };

  useEffect(() => {
    if (isVisible) {
      isTokenCaptured.current = false;
      setIsOnProvider(false);
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
          {(!isOnProvider || isLoading) && <AppSpinner size='large' isFullScreen />}
          {isVisible && (
            <WebView
              ref={webViewRef}
              source={{ uri: `${apiUrl}/oauth/${provider}/login` }}
              userAgent={mobileUserAgent}
              incognito
              thirdPartyCookiesEnabled
              javaScriptEnabled
              domStorageEnabled
              style={commonStyle.fullFlex}
              onMessage={handleMessage}
              onNavigationStateChange={handleNavigationStateChange}
            />
          )}
        </View>
      </AppSafeAreaView>
    </FullScreenModal>
  );
}
