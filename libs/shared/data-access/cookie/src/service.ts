import NitroCookies from 'react-native-nitro-cookies';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

class CookieService {
  public async setToken(token: string): Promise<void> {
    const apiUrl = `${getApiUrl()}/api/`;

    await NitroCookies.set(apiUrl, {
      name: 'token',
      value: token,
      path: '/',
      secure: true,
      httpOnly: false,
    });
  }

  public async clearAll(): Promise<void> {
    await NitroCookies.clearAll();
  }
}

export const cookieService = new CookieService();
