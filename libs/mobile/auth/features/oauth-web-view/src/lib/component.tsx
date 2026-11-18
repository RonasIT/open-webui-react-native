import { useSelector } from '@legendapp/state/react';
import { useTranslation } from '@ronas-it/react-native-common-modules/i18n';
import * as Sentry from '@sentry/react-native';
import { plainToInstance } from 'class-transformer';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
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
import { authService, MfaChallenge, Provider } from '@open-webui-react-native/shared/data-access/api';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl, getHost } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { WebViewMessageType } from './enums';
import { mfaChallengeCaptureScript, mobileUserAgent, tokenCaptureScript } from './script';
import { isMfaOrPendingApprovalUrl } from './utils';

// If the token cookie doesn't appear shortly after we land back on Open WebUI,
// fail loudly instead of leaving the user on a stuck spinner.
const TOKEN_CAPTURE_TIMEOUT = 10000;

// NOTE: Android `incognito` calls `CookieManager.removeAllCookies` and does not wait, so a write
// done in the same turn can be wiped. The blank page's load is the mount; the write is repeated
// until the jar keeps the pass.
const androidPassWriteAttempts = 6;
const androidPassWriteInterval = 100;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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
  onMfaChallenge: (challenge: MfaChallenge) => void;
};

export function OauthWebView({
  isVisible,
  provider,
  onClose,
  onGetToken,
  onMfaChallenge,
}: OauthWebViewProps): ReactElement {
  const translate = useTranslation('AUTH.SIGN_IN.OAUTH_WEB_VIEW_MODAL');
  const webViewRef = useRef<WebView>(null);
  const isTokenCaptured = useRef(false);
  const captureTokenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen = useRef(false);
  const isSettingAndroidPass = useRef(false);
  const wasVisible = useRef(false);
  const androidWriteGeneration = useRef(0);

  const apiUrl = getApiUrl();
  const apiHost = getHost(apiUrl);
  const accessPass = useSelector(authState$.accessPass);
  const accessPassValue = accessPass?.serverUrl === apiUrl ? accessPass.value : undefined;
  const loginUrl = `${apiUrl}/oauth/${provider}/login`;

  // Spinner is driven by the real page-load state and the token-validation step.
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  // NOTE: iOS must have the pass in the native jar before the WebView mounts: `sharedCookiesEnabled`
  // copies that jar once, on open. Android mounts first, on a blank page, because that mount wipes the jar.
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [isAndroidPassSet, setIsAndroidPassSet] = useState(false);
  // Whether the WebView is currently on a cross-origin IdP page (e.g. Google).
  // We suppress the page-load spinner there: on Android some IdP pages don't fire
  // `onLoadEnd` reliably, which would leave the loader stuck over an otherwise-usable
  // login page. This only gates the spinner — success is still detected by path below.
  const [isOnProviderPage, setIsOnProviderPage] = useState(false);
  const sourceUri = Platform.OS === 'android' && accessPassValue && !isAndroidPassSet ? 'about:blank' : loginUrl;

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
    const host = getHost(state.url);
    // Update the provider-page flag on every navigation event (loading included),
    // so the spinner is suppressed as soon as we leave our host for the IdP.
    // The Android blank page is not an IdP: the spinner stays up while the pass is written.
    setIsOnProviderPage(state.url !== 'about:blank' && host !== apiHost);

    if (state.loading || isTokenCaptured.current) {
      return;
    }

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

    if (isMfaOrPendingApprovalUrl(state.url)) {
      clearCaptureTimeout();
      setIsProcessing(false);

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

    if (payload?.type === WebViewMessageType.MFA && !isTokenCaptured.current) {
      isTokenCaptured.current = true;
      clearCaptureTimeout();
      onMfaChallenge(plainToInstance(MfaChallenge, payload.challenge as object));

      return;
    }

    if (payload?.type === WebViewMessageType.MFA_ERROR) {
      handleFailOauthFlow();

      return;
    }

    if (payload?.type === WebViewMessageType.TOKEN && payload.token && !isTokenCaptured.current) {
      isTokenCaptured.current = true;
      clearCaptureTimeout();
      handleToken(payload.token);
    }
  };

  // NOTE: Android's incognito mount wipes the jar, so the pass is written once that blank page has loaded.
  const handleLoadEnd = async (): Promise<void> => {
    setIsPageLoading(false);

    if (Platform.OS !== 'android' || !accessPassValue || isAndroidPassSet || isSettingAndroidPass.current) {
      return;
    }

    isSettingAndroidPass.current = true;
    const writeGeneration = androidWriteGeneration.current;

    try {
      for (let attempt = 0; attempt < androidPassWriteAttempts; attempt++) {
        await cookieService.setAccessPass(apiUrl, accessPassValue);

        if (!isOpen.current || writeGeneration !== androidWriteGeneration.current) {
          cookieService.clearOauthJar(apiUrl);

          return;
        }

        const stored = await cookieService.getAccessPass(apiUrl);

        if (!isOpen.current || writeGeneration !== androidWriteGeneration.current) {
          cookieService.clearOauthJar(apiUrl);

          return;
        }

        if (stored === accessPassValue) {
          setIsAndroidPassSet(true);

          return;
        }

        await wait(androidPassWriteInterval);
      }
    } catch (error) {
      // NOTE: A failed write still opens the login page, so the person is not left on a blank WebView.
      Sentry.captureException(error);
    }

    if (isOpen.current && writeGeneration === androidWriteGeneration.current) {
      setIsAndroidPassSet(true);
    }
  };

  useEffect(() => {
    if (isVisible) {
      isTokenCaptured.current = false;
      setIsPageLoading(true);
      setIsProcessing(false);
      setIsOnProviderPage(false);
    }

    return clearCaptureTimeout;
  }, [isVisible]);

  useEffect(() => {
    isOpen.current = isVisible;

    if (!isVisible) {
      setIsWebViewReady(false);
      setIsAndroidPassSet(false);
      isSettingAndroidPass.current = false;
      androidWriteGeneration.current += 1;

      // NOTE: Every provider mounts its own WebView, closed. Only the one that was actually open may
      // clear the jar — a sibling's timer would delete the pass under the WebView that is signing in.
      if (!wasVisible.current) {
        return;
      }

      wasVisible.current = false;
      cookieService.clearOauthJar(apiUrl);
      // NOTE: iOS copies the WebView jar back into the native one from an async callback that can
      // land after the first clear. Repeat until that callback has had time to run.
      const clearTimer = setInterval(() => cookieService.clearOauthJar(apiUrl), 100);
      const stopTimer = setTimeout(() => clearInterval(clearTimer), 500);

      return () => {
        clearInterval(clearTimer);
        clearTimeout(stopTimer);
      };
    }

    wasVisible.current = true;
    let isCancelled = false;

    const prepareNativeJar = async (): Promise<void> => {
      if (accessPassValue && Platform.OS === 'ios') {
        await cookieService.setAccessPass(apiUrl, accessPassValue);
      }

      if (isCancelled) {
        cookieService.clearOauthJar(apiUrl);

        return;
      }

      setIsWebViewReady(true);
    };

    prepareNativeJar();

    return () => {
      isCancelled = true;
    };
  }, [isVisible, apiUrl, accessPassValue]);

  useEffect(() => {
    return () => {
      if (wasVisible.current) {
        cookieService.clearOauthJar(apiUrl);
      }
    };
  }, [apiUrl]);

  return (
    <FullScreenModal isVisible={isVisible}>
      <AppSafeAreaView edges={['top']} className='flex-1 bg-background-primary'>
        <View className='flex-row justify-end px-16 py-12'>
          <AppPressable onPress={onClose} hitSlop={12}>
            <AppText>{translate('BUTTON_CLOSE')}</AppText>
          </AppPressable>
        </View>
        <View className='h-full'>
          {((isPageLoading && !isOnProviderPage) || isProcessing) && <AppSpinner size='large' isFullScreen />}
          {isVisible && isWebViewReady && (
            <WebView
              ref={webViewRef}
              source={{ uri: sourceUri }}
              injectedJavaScriptBeforeContentLoaded={mfaChallengeCaptureScript}
              userAgent={mobileUserAgent}
              incognito
              sharedCookiesEnabled={Platform.OS === 'ios' && !!accessPassValue}
              thirdPartyCookiesEnabled
              javaScriptEnabled
              domStorageEnabled
              style={commonStyle.fullFlex}
              onMessage={handleMessage}
              onLoadStart={() => setIsPageLoading(true)}
              onLoadEnd={handleLoadEnd}
              onNavigationStateChange={handleNavigationStateChange}
            />
          )}
        </View>
      </AppSafeAreaView>
    </FullScreenModal>
  );
}
