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

// If the token cookie doesn't appear shortly after we land back on Open WebUI,
// fail loudly instead of leaving the user on a stuck spinner.
const TOKEN_CAPTURE_TIMEOUT = 6000;

// Path portion of a URL, without query/hash. We match on PATH (not host) because
// the IdP (e.g. Keycloak) may be reverse-proxied under the SAME origin as Open
// WebUI, in which case a host-based check can never tell them apart.
const getPath = (url: string): string =>
  url
    .replace(/^https?:\/\/[^/]+/i, '')
    .split('?')[0]
    .split('#')[0];

export type OauthWebViewProps = {
  isVisible: boolean;
  provider: Provider;
  onClose: () => void;
  onGetToken: (token: string) => void;
};

export function OauthWebView({ isVisible, provider, onClose, onGetToken }: OauthWebViewProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OAUTH_WEB_VIEW_MODAL');
  const webViewRef = useRef<WebView>(null);
  const isTokenCaptured = useRef(false);
  const captureTokenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiUrl = getApiUrl();
  const apiHost = getHost(apiUrl);

  // Spinner is driven by the real page-load state and the token-validation step —
  // never by "are we on the provider host", so the IdP login form is always usable.
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const clearCaptureTimeout = (): void => {
    if (captureTokenTimeout.current) {
      clearTimeout(captureTokenTimeout.current);
      captureTokenTimeout.current = null;
    }
  };

  const handleFailOauthFlow = (): void => {
    clearCaptureTimeout();
    setIsProcessing(false);
    ToastService.showError(translate('TEXT_THIS_SIGN_IN_METHOD_IS_UNAVAILABLE'));
    appStorageService.token.set(null);
    onClose();
  };

  const handleNavigationStateChange = (state: WebViewNavigation): void => {
    if (state.loading || isTokenCaptured.current) {
      return;
    }

    const host = getHost(state.url);
    const path = getPath(state.url);

    // Open WebUI ends the OAuth flow by redirecting to its own `/oauth/<provider>/callback`
    // and then to `/auth`, setting a JS-readable `token` cookie along the way. We detect
    // that return by path, so it works whether the IdP is on a separate domain or the
    // same origin as Open WebUI.
    const isBackOnApp =
      host === apiHost && (path === `/oauth/${provider}/callback` || path === '/auth' || path === '/' || path === '');

    if (!isBackOnApp) {
      return;
    }

    // Backend signals OAuth failures by redirecting to `/auth?error=...`.
    if (/[?&]error=/.test(state.url)) {
      handleFailOauthFlow();

      return;
    }

    setIsProcessing(true);
    webViewRef.current?.injectJavaScript(tokenCaptureScript);

    clearCaptureTimeout();
    captureTokenTimeout.current = setTimeout(() => {
      if (!isTokenCaptured.current) {
        handleFailOauthFlow();
      }
    }, TOKEN_CAPTURE_TIMEOUT);
  };

  const handleToken = async (token: string): Promise<void> => {
    try {
      setIsProcessing(true);
      appStorageService.token.set(token);
      // We need to validate the token by calling getProfile.
      await authService.getProfile();
      setIsProcessing(false);
      onGetToken(token);
    } catch {
      handleFailOauthFlow();
    }
  };

  const handleMessage = (event: WebViewMessageEvent): void => {
    const payload = JSON.parse(event.nativeEvent.data);

    if (payload?.type === 'token' && payload.token && !isTokenCaptured.current) {
      isTokenCaptured.current = true;
      clearCaptureTimeout();
      handleToken(payload.token);
    }
  };

  useEffect(() => {
    if (isVisible) {
      isTokenCaptured.current = false;
      setIsPageLoading(true);
      setIsProcessing(false);
    }

    return clearCaptureTimeout;
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
          {(isPageLoading || isProcessing) && <AppSpinner size='large' isFullScreen />}
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
