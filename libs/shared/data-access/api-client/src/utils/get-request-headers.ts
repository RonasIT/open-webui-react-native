import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

// NOTE: Scheme and port belong to the server. `http://` on the same name is another origin and must not get the token.
const readOrigin = (url: string): string | undefined => {
  try {
    const { origin } = new URL(url);

    return origin === 'null' ? undefined : origin;
  } catch {
    return undefined;
  }
};

export const getRequestHeaders = (requestUrl: string): Record<string, string> => {
  // NOTE: Not a secret, so it goes with every request, a URL check of an unsaved server included.
  // With it Cloudflare Access answers 401 instead of a redirect the device follows to its login page.
  const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
  const requestOrigin = readOrigin(requestUrl);

  if (!requestOrigin) {
    return headers;
  }

  const token = appStorageService.token.get();
  const accessPass = authState$.accessPass.get();

  // NOTE: The token goes only to the saved server, the Access pass only to the server it was issued for.
  if (token && requestOrigin === readOrigin(getApiUrl())) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (accessPass && requestOrigin === readOrigin(accessPass.serverUrl)) {
    headers.Cookie = `CF_Authorization=${accessPass.value}`;
  }

  return headers;
};
