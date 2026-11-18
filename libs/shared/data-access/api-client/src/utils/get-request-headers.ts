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

// NOTE: `serverUrl` is the server the request is meant for: the saved one, or the one a URL check reaches.
// The token goes only to the saved server, the Access pass only to the server it was issued for.
export const getRequestHeaders = (
  requestUrl: string,
  serverUrl: string = getApiUrl(),
): Record<string, string> | undefined => {
  const requestOrigin = readOrigin(requestUrl);

  if (!requestOrigin || requestOrigin !== readOrigin(serverUrl)) {
    return undefined;
  }

  // NOTE: With this header Cloudflare Access answers 401 instead of a redirect the device follows to its login page.
  const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
  const token = appStorageService.token.get();
  const accessPass = authState$.accessPass.get();

  if (token && requestOrigin === readOrigin(getApiUrl())) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (accessPass && requestOrigin === readOrigin(accessPass.serverUrl)) {
    headers.Cookie = `CF_Authorization=${accessPass.value}`;
  }

  return headers;
};
