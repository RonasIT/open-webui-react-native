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

export const getRequestHeaders = (requestUrl: string): Record<string, string> | undefined => {
  const requestOrigin = readOrigin(requestUrl);
  const serverOrigin = readOrigin(getApiUrl());

  if (!requestOrigin || !serverOrigin || requestOrigin !== serverOrigin) {
    return undefined;
  }

  const token = appStorageService.token.get();

  if (!token) {
    return undefined;
  }

  return { Authorization: `Bearer ${token}` };
};
