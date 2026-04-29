// eslint-disable-next-line @nx/enforce-module-boundaries
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';

export const ronasApiUrl = appEnv.select({
  development: 'https://ai.ronas.online',
  staging: 'https://ai.ronas.online',
  production: 'https://ai.ronas.online',
});

export const getApiUrl = (): string => {
  const normalizeUrl = (url?: string): string => (url ?? '').trim().replace(/\/+$/, '');

  const stored = normalizeUrl(appStorageService.apiUrl.get());
  const fallback = normalizeUrl(ronasApiUrl);

  return stored || fallback;
};
