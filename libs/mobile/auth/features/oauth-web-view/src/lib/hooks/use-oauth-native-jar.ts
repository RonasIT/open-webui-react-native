import * as Sentry from '@sentry/react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { cookieService } from '@open-webui-react-native/shared/data-access/cookie';

// NOTE: Android `incognito` calls `CookieManager.removeAllCookies` and does not wait, so a write
// done in the same turn can be wiped. The blank page's load is the mount; the write is repeated
// until the jar keeps the pass.
const androidPassWriteAttempts = 6;
const androidPassWriteInterval = 100;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

interface UseOauthNativeJarParams {
  isVisible: boolean;
  apiUrl: string;
  accessPassValue: string | undefined;
}

interface UseOauthNativeJarResult {
  isWebViewReady: boolean;
  isAndroidPassSet: boolean;
  writeAndroidPass: () => Promise<void>;
}

export function useOauthNativeJar({
  isVisible,
  apiUrl,
  accessPassValue,
}: UseOauthNativeJarParams): UseOauthNativeJarResult {
  const isSettingAndroidPass = useRef(false);
  const wasVisible = useRef(false);
  const androidWriteGeneration = useRef(0);

  // NOTE: iOS must have the pass in the native jar before the WebView mounts: `sharedCookiesEnabled`
  // copies that jar once, on open. Android mounts first, on a blank page, because that mount wipes the jar.
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [isAndroidPassSet, setIsAndroidPassSet] = useState(false);

  const writeAndroidPass = async (): Promise<void> => {
    if (Platform.OS !== 'android' || !accessPassValue || isAndroidPassSet || isSettingAndroidPass.current) {
      return;
    }

    isSettingAndroidPass.current = true;
    const writeGeneration = androidWriteGeneration.current;

    try {
      for (let attempt = 0; attempt < androidPassWriteAttempts; attempt++) {
        await cookieService.setAccessPass(apiUrl, accessPassValue);

        if (writeGeneration !== androidWriteGeneration.current) {
          cookieService.clearOauthJar(apiUrl);

          return;
        }

        const stored = await cookieService.getAccessPass(apiUrl);

        if (writeGeneration !== androidWriteGeneration.current) {
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

    if (writeGeneration === androidWriteGeneration.current) {
      setIsAndroidPassSet(true);
    }
  };

  useEffect(() => {
    // NOTE: Every provider mounts its own WebView, closed. Only the one that was actually open may
    // clear the jar — a sibling's timer would delete the pass under the WebView that is signing in.
    function clearJarAfterClose(): (() => void) | void {
      setIsWebViewReady(false);
      setIsAndroidPassSet(false);
      isSettingAndroidPass.current = false;
      androidWriteGeneration.current += 1;

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

    // NOTE: iOS writes the pass before the WebView mounts. The returned cleanup marks that write
    // cancelled when the modal closes during the wait.
    function prepareJarBeforeOpen(): () => void {
      wasVisible.current = true;

      let isCancelled = false;

      async function writePass(): Promise<void> {
        if (accessPassValue && Platform.OS === 'ios') {
          await cookieService.setAccessPass(apiUrl, accessPassValue);
        }

        if (isCancelled) {
          cookieService.clearOauthJar(apiUrl);

          return;
        }

        setIsWebViewReady(true);
      }

      writePass();

      return () => {
        isCancelled = true;
      };
    }

    if (!isVisible) {
      return clearJarAfterClose();
    }

    return prepareJarBeforeOpen();
  }, [isVisible, apiUrl, accessPassValue]);

  // NOTE: The modal can disappear while it is still open, and the server URL can change under it.
  // This cleanup keeps the apiUrl from the run that started it, so the previous server is cleared.
  useEffect(() => {
    function clearJarIfStillOpen(): void {
      if (wasVisible.current) {
        cookieService.clearOauthJar(apiUrl);
      }
    }

    return clearJarIfStillOpen;
  }, [apiUrl]);

  return { isWebViewReady, isAndroidPassSet, writeAndroidPass };
}
