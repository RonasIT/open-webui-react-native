import { ApiService, tokenInterceptor, unauthorizedInterceptor } from '@ronas-it/axios-api-client';
import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { authState$ } from '@open-web-ui-mobile-client-react-native/shared/data-access/auth';
import { appStorageService } from '@open-web-ui-mobile-client-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/config';
import { ToastService } from '@open-web-ui-mobile-client-react-native/shared/utils/toast-service';
import { apiConfig } from './config';
import { errorCatcherInterceptor } from './interceptors';

const apiServiceCache = new Map<string, ApiService>();

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
        unauthorizedInterceptor({
          publicEndpoints: apiConfig.auth.unauthorizedRoutes,
          onError: () => {
            authState$.isUnauthorized.set(true);
            ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_YOUR_SESSION_HAS_EXPIRED'));
          },
        }),
      ],
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
