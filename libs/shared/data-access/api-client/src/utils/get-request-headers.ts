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

// NOTE: Headers go only to our server: the saved one, or the one the Access pass was issued for before it is saved.
export const getRequestHeaders = (requestUrl: string): Record<string, string> | undefined => {
  const requestOrigin = readOrigin(requestUrl);
  const accessPass = authState$.accessPass.get();
  const isSavedServer = !!requestOrigin && requestOrigin === readOrigin(getApiUrl());
  const isAccessPassServer = !!requestOrigin && !!accessPass && requestOrigin === readOrigin(accessPass.serverUrl);

  if (!isSavedServer && !isAccessPassServer) {
    return undefined;
  }

  // NOTE: With this header Cloudflare Access answers 401 instead of a redirect the device follows to its login page.
  const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
  const token = appStorageService.token.get();

  if (token && isSavedServer) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (accessPass && isAccessPassServer) {
    headers.Cookie = `CF_Authorization=${accessPass.value}`;
  }

  return headers;
};
