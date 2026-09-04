import { ApiService, tokenInterceptor, unauthorizedInterceptor } from '@ronas-it/axios-api-client';
import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AxiosError } from 'axios';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { apiConfig } from './config';
import { errorCatcherInterceptor, profileNotFoundInterceptor } from './interceptors';

const apiServiceCache = new Map<string, ApiService>();

const handleUnauthorized = unauthorizedInterceptor({
  publicEndpoints: apiConfig.auth.unauthorizedRoutes,
  onError: () => {
    authState$.isUnauthorized.set(true);
    ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_YOUR_SESSION_HAS_EXPIRED'));
  },
});

const setupInterceptors = (service: ApiService): void => {
  service.useInterceptors({
    request: [
      [
        tokenInterceptor({
          getToken: () => appStorageService.token.get() ?? '',
        }),
      ],
    ],
    response: [
      [
        null,
        // NOTE: Some Open WebUI endpoints answer 401 for a resource that simply does not exist (a
        // group or a chat that has been deleted). `skipUnauthorized` lets such a lookup fail on its
        // own instead of signing the user out of a perfectly valid session.
        (error: AxiosError<{ error?: string }>) =>
          error.config?.params?.skipUnauthorized ? Promise.reject(error) : handleUnauthorized(error),
      ],
      [null, profileNotFoundInterceptor()],
      [
        null,
        errorCatcherInterceptor({
          onError: (error: string) => {
            ToastService.showError(error);
          },
        }),
      ],
    ],
  });
};

export const getApiService = (url?: string): ApiService => {
  const apiUrl = url || `${getApiUrl()}/api/`;

  if (apiServiceCache.has(apiUrl)) {
    return apiServiceCache.get(apiUrl)!;
  }

  const service = new ApiService(apiUrl);
  setupInterceptors(service);
  apiServiceCache.set(apiUrl, service);

  return service;
};
