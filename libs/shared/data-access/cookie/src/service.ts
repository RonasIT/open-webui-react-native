import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import NitroCookies from 'react-native-nitro-cookies';

// NOTE: On iOS a WebView keeps its cookies in the WebKit store, apart from the store app requests use.
const isWebKitStore = Platform.OS === 'ios';

class CookieService {
  // NOTE: Old versions mirrored the Open WebUI token into a `token` cookie. React Native's socket on iOS
  // joins jar cookies to our `Cookie` header with a comma, which hides the Access pass from Cloudflare.
  public async clearLegacyToken(serverUrl: string): Promise<void> {
    await this.clearByName(serverUrl, 'token', 'clearLegacyToken');
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
