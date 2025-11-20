 
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';
import { appEnv } from '@open-web-ui-mobile-client-react-native/shared/utils/app-env';

export const ronasApiUrl = appEnv.select({
  development: 'https://dev.ai.ronas.cloud',
  staging: 'https://dev.ai.ronas.cloud',
  production: 'https://ai.ronas.cloud',
});

export const getApiUrl = (): string => {
  return appStorageService.apiUrl.get() || ronasApiUrl;
};
