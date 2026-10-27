/* eslint-disable @nx/enforce-module-boundaries */

import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';
import { normalizeServerUrl } from './normalize-server-url';

export const ronasApiUrl = appEnv.select({
  development: 'https://ai.ronas.online',
  staging: 'https://ai.ronas.online',
  production: 'https://ai.ronas.online',
});

export const testApiUrl = 'https://ai.test-api.online';

export const resolveApiUrl = (url: string): string => {
  return normalizeServerUrl(url) === normalizeServerUrl(testApiUrl)
    ? normalizeServerUrl(ronasApiUrl)
    : normalizeServerUrl(url);
};

export const isTestApiUrl = (url?: string): boolean =>
  normalizeServerUrl(url ?? appStorageService.apiUrl.get()) === normalizeServerUrl(testApiUrl);

export const getDisplayApiUrl = (): string => {
  const stored = normalizeServerUrl(appStorageService.apiUrl.get());
  const fallback = normalizeServerUrl(ronasApiUrl);

  return stored || fallback;
};

export const getApiUrl = (): string => {
  return resolveApiUrl(getDisplayApiUrl());
};

export const getHost = (url: string): string =>
  url
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .toLowerCase();
