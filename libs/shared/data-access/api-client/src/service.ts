import { ApiService } from '@ronas-it/axios-api-client';
import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AxiosError, AxiosResponse, HttpStatusCode } from 'axios';
import { AppState } from 'react-native';
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

// NOTE: A proxy that blocks the device rejects every request: the person needs its notice once, not per request.
// The notice shows again after a request gets through or the app comes back from the background.
let isProxyRejectionShown = false;

AppState.addEventListener('change', (status) => {
  if (status === 'active') {
    isProxyRejectionShown = false;
  }
});

const PROXY_REJECTION_TOAST_DURATION = 5000;

const onProxyRejection = (): void => {
  if (isProxyRejectionShown) {
    return;
  }

  isProxyRejectionShown = true;
  ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_PROXY_REJECTION'), PROXY_REJECTION_TOAST_DURATION);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  isProxyRejectionShown = false;

  return response;
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
      [onResponse, sentryErrorCatcherInterceptor()],
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
          onProxyRejection,
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
