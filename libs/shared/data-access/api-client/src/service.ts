import { ApiService, tokenInterceptor } from '@ronas-it/axios-api-client';
import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AxiosError, HttpStatusCode } from 'axios';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { UserRole } from '@open-webui-react-native/shared/data-access/common';
import { appStorageService } from '@open-webui-react-native/shared/data-access/storage';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { apiConfig } from './config';
import {
  errorCatcherInterceptor,
  getErrorMessage,
  profileNotFoundInterceptor,
  sentryErrorCatcherInterceptor,
  unauthorizedInterceptor,
} from './interceptors';
import { ApiErrorData } from './types';

const apiServiceCache = new Map<string, ApiService>();

let sessionCheck: Promise<boolean> | null = null;

// NOTE: Concurrent 401s share one profile request. A 401 from it logs out on its own; on a network error the session is kept.
const checkSession = (service: ApiService): Promise<boolean> => {
  sessionCheck ??= service
    .get<{ role?: UserRole }>('v1/auths/', { skipToast: true })
    .then(({ role }) => role !== UserRole.PENDING)
    .catch((error: AxiosError) => error.response?.status !== HttpStatusCode.Unauthorized)
    .finally(() => {
      sessionCheck = null;
    });

  return sessionCheck;
};

const onSessionExpired = (): void => {
  if (authState$.isUnauthorized.get()) {
    return;
  }

  authState$.isUnauthorized.set(true);
  ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_YOUR_SESSION_HAS_EXPIRED'));
};

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
      [null, sentryErrorCatcherInterceptor()],
      [
        null,
        unauthorizedInterceptor({
          publicEndpoints: apiConfig.auth.unauthorizedRoutes,
          hasToken: () => Boolean(appStorageService.token.get()),
          checkSession: () => checkSession(service),
          onSessionExpired,
          onError: ({ response }: AxiosError<ApiErrorData>) => {
            ToastService.showError(getErrorMessage(response?.data, response?.status));
          },
        }),
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
