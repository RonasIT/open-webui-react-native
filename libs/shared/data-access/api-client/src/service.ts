import { ApiService } from '@ronas-it/axios-api-client';
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
  requestHeadersInterceptor,
  sentryErrorCatcherInterceptor,
  unauthorizedInterceptor,
} from './interceptors';
import { ApiErrorData } from './types';
import { showProxyRejectionNotice } from './utils/proxy-rejection-notice';

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

const setupInterceptors = (service: ApiService, apiUrl: string): void => {
  service.useInterceptors({
    request: [[requestHeadersInterceptor(apiUrl)]],
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
          onProxyRejection: showProxyRejectionNotice,
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

  // NOTE: Without `withCredentials: false` React Native adds the native jar's cookies, and a stale `CF_Authorization`
  // there breaks Access. `X-Requested-With` is set here too, since a URL check reaches a server that is not saved yet.
  const service = new ApiService(apiUrl, {
    withCredentials: false,
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  setupInterceptors(service, apiUrl);
  apiServiceCache.set(apiUrl, service);

  return service;
};
