import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import {
  createReactotronApiLogger,
  NitroApiService,
  tokenInterceptor,
  unauthorizedInterceptor,
} from '@open-webui-react-native/shared/data-access/nitro-api-client';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { apiConfig } from './config';
import { errorCatcherInterceptor, profileNotFoundInterceptor } from './interceptors';

const apiServiceCache = new Map<string, NitroApiService>();

const setupInterceptors = (service: NitroApiService): void => {
  service.useInterceptors({
    request: [
      tokenInterceptor({
        getToken: () => appStorageService.token.get() ?? '',
      }),
    ],
    error: [
      unauthorizedInterceptor({
        publicEndpoints: apiConfig.auth.unauthorizedRoutes,
        onError: () => {
          authState$.isUnauthorized.set(true);
          ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_YOUR_SESSION_HAS_EXPIRED'));
        },
      }),
      profileNotFoundInterceptor(),
      errorCatcherInterceptor({
        onError: (error: string) => {
          ToastService.showError(error);
        },
      }),
    ],
  });
};

export const getApiService = (url?: string): NitroApiService => {
  const apiUrl = url || `${getApiUrl()}/api/`;

  if (apiServiceCache.has(apiUrl)) {
    return apiServiceCache.get(apiUrl)!;
  }

  const service = new NitroApiService(apiUrl, { logger: createReactotronApiLogger(), credentials: 'include' });
  setupInterceptors(service);
  apiServiceCache.set(apiUrl, service);

  return service;
};
