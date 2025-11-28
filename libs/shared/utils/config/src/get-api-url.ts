// eslint-disable-next-line @nx/enforce-module-boundaries
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { appEnv } from '@open-webui-react-native/shared/utils/app-env';

export const ronasApiUrl = appEnv.select({
  development: 'https://dev.ai.ronas.cloud',
  staging: 'https://dev.ai.ronas.cloud',
  production: 'https://ai.ronas.cloud',
});

export const getApiUrl = (): string => {
  return appStorageService.apiUrl.get() || ronasApiUrl;
};
