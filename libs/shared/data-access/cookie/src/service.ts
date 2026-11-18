import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import NitroCookies from 'react-native-nitro-cookies';

const accessPassCookieName = 'CF_Authorization';
// NOTE: On iOS a WebView keeps its cookies in the WebKit store, apart from the store app requests use.
const isWebKitStore = Platform.OS === 'ios';

class CookieService {
  // NOTE: Old versions mirrored the Open WebUI token into a `token` cookie. React Native's socket on iOS
  // joins jar cookies to our `Cookie` header with a comma, which hides the Access pass from Cloudflare.
  public async clearLegacyToken(serverUrl: string): Promise<void> {
    await this.clearByName(serverUrl, 'token', 'clearLegacyToken');
  }

  public async getAccessPass(serverUrl: string): Promise<string | undefined> {
    const cookies = await NitroCookies.get(serverUrl, isWebKitStore);

    return cookies[accessPassCookieName]?.value || undefined;
  }

  // NOTE: The native jar, not the WebKit store. iOS copies that jar into an incognito WebView when
  // `sharedCookiesEnabled` is set; Android's WebView reads this same jar.
  public async setAccessPass(serverUrl: string, value: string): Promise<void> {
    try {
      await NitroCookies.set(
        serverUrl,
        {
          name: accessPassCookieName,
          value,
          path: '/',
          secure: serverUrl.startsWith('https://'),
        },
        false,
      );

      // NOTE: Android `CookieManager.setCookie` returns before a following page load can see the cookie.
      if (Platform.OS === 'android') {
        await NitroCookies.flush();
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('cookie.operation', 'setAccessPass');
        Sentry.captureException(error);
      });
    }
  }

  // NOTE: The app sends the pass as its own header. A copy left in a native store would be added to requests and break Access.
  public async clearAccessPass(serverUrl: string): Promise<void> {
    await this.clearByName(serverUrl, accessPassCookieName, 'clearAccessPass');
  }

  // NOTE: Synchronous on purpose. The OAuth WebView closes and the socket opens in the same moment, and an
  // awaited clear can lose that race. iOS also copies the WebView's `token` cookie into this jar and then
  // joins the jar onto the socket's Cookie header with a comma, which hides the pass. The WebView observer
  // can write both back after unmount, so the caller clears once more a moment later.
  public clearOauthJar(serverUrl: string): void {
    try {
      NitroCookies.clearByNameSync(serverUrl, accessPassCookieName);
      NitroCookies.clearByNameSync(serverUrl, 'token');

      // NOTE: Android expires a cookie with another setCookie, which the next request can miss until flush.
      if (Platform.OS === 'android') {
        void NitroCookies.flush();
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('cookie.operation', 'clearOauthJar');
        Sentry.captureException(error);
      });
    }
  }

  // NOTE: Drops all a sign-in WebView left, the Cloudflare login session (`CF_Session`) included. On Android
  // the WebView and the app share one store; on iOS the WebKit store is separate and needs its own call.
  public async clearWebViewSession(): Promise<void> {
    try {
      await NitroCookies.clearAll();

      if (isWebKitStore) {
        await NitroCookies.clearAll(true);
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('cookie.operation', 'clearWebViewSession');
        Sentry.captureException(error);
      });
    }
  }

  public async clearAll(): Promise<void> {
    await NitroCookies.clearAll();
  }

  private async clearByName(serverUrl: string, name: string, operation: string): Promise<void> {
    try {
      await NitroCookies.clearByName(serverUrl, name);

      if (isWebKitStore) {
        await NitroCookies.clearByName(serverUrl, name, true);
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('cookie.operation', operation);
        Sentry.captureException(error);
      });
    }
  }
}

export const cookieService = new CookieService();
