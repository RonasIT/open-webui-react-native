import * as Sentry from '@sentry/react-native';
import NitroCookies from 'react-native-nitro-cookies';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

class CookieService {
  public async setToken(token: string): Promise<void> {
    const apiUrl = `${getApiUrl()}/api/`;

    try {
      await NitroCookies.set(apiUrl, {
        name: 'token',
        value: token,
        path: '/',
        secure: true,
        httpOnly: false,
      });
    } catch (error) {
      // NOTE: callers (authState$.signIn, appState$.init) fire this without awaiting it — the real
      // auth token already lives in storage and the Authorization header by this point, so this
      // cookie is only a best-effort mirror (used by webviews). Report but don't let it surface as
      // an unhandled promise rejection.
      Sentry.withScope((scope) => {
        scope.setTag('cookie.operation', 'setToken');
        Sentry.captureException(error);
      });
    }
  }

  public async clearAll(): Promise<void> {
    await NitroCookies.clearAll();
  }
}

export const cookieService = new CookieService();
