import CookieManager from '@react-native-cookies/cookies';
import { getApiUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/config';

class CookieService {
  public async setToken(token: string): Promise<void> {
    const apiUrl = `${getApiUrl()}/api/`;

    await CookieManager.set(apiUrl, {
      name: 'token',
      value: token,
      path: '/',
      secure: true,
      httpOnly: false,
    });
  }

  public async clearAll(): Promise<void> {
    await CookieManager.clearAll();
  }
}

export const cookieService = new CookieService();
