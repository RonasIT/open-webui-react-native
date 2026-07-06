// eslint-disable-next-line @nx/enforce-module-boundaries
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';

export const ronasApiUrl = appEnv.select({
  development: 'https://ai.ronas.online',
  staging: 'https://ai.ronas.online',
  production: 'https://ai.ronas.online',
});

const testApiUrl = 'https://ai.test-api.online';

const normalizeUrl = (url?: string): string => (url ?? '').trim().replace(/\/+$/, '');

export const resolveApiUrl = (url: string): string => {
  return normalizeUrl(url) === normalizeUrl(testApiUrl) ? normalizeUrl(ronasApiUrl) : normalizeUrl(url);
};

export const getApiUrl = (): string => {
  const stored = normalizeUrl(appStorageService.apiUrl.get());
  const fallback = normalizeUrl(ronasApiUrl);

  return resolveApiUrl(stored || fallback);
};

export const getHost = (url: string): string =>
  url
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .toLowerCase();
