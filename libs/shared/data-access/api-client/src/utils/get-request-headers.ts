import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

export interface ServerCredentials {
  serverUrl: string;
  token?: string;
  accessPass?: string;
}

// NOTE: Scheme and port belong to the server. `http://` on the same name is another origin and must not get the token.
const readOrigin = (url: string): string | undefined => {
  try {
    const { origin } = new URL(url);

    return origin === 'null' ? undefined : origin;
  } catch {
    return undefined;
  }
};

const getSavedServerCredentials = (): ServerCredentials => ({
  serverUrl: getApiUrl(),
  token: appStorageService.token.get(),
  accessPass: appStorageService.accessPass.get(),
});

export const getRequestHeaders = (
  requestUrl: string,
  credentials: ServerCredentials = getSavedServerCredentials(),
): Record<string, string> | undefined => {
  const requestOrigin = readOrigin(requestUrl);
  const serverOrigin = readOrigin(credentials.serverUrl);

  if (!requestOrigin || !serverOrigin || requestOrigin !== serverOrigin) {
    return undefined;
  }

  // NOTE: With this header Cloudflare Access answers 401 instead of a redirect the device follows to its login page.
  const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };

  if (credentials.token) {
    headers.Authorization = `Bearer ${credentials.token}`;
  }

  if (credentials.accessPass) {
    headers.Cookie = `CF_Authorization=${credentials.accessPass}`;
  }

  return headers;
};
