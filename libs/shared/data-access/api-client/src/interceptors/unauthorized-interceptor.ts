import { AxiosError, HttpStatusCode } from 'axios';
import { ApiErrorData } from '../types';
import { isCloudflareAccessError } from '../utils/is-cloudflare-access-error';
import { isGetProfileRequest } from '../utils/is-get-profile-request';

type UnauthorizedInterceptorOptions = {
  publicEndpoints: Array<string>;
  hasToken: () => boolean;
  // Resolves to false only when the session itself is invalid.
  checkSession: () => Promise<boolean>;
  onSessionExpired: () => void;
  onAccessPassExpired: (error: AxiosError<ApiErrorData>) => void;
  onError: (error: AxiosError<ApiErrorData>) => void;
};

// NOTE: Open WebUI also answers 401 for a valid session when a chat is missing or not owned by the user,
// or a permission is off, so a 401 alone does not mean the session expired. Only `GET v1/auths/` is trusted.
export const unauthorizedInterceptor =
  ({ publicEndpoints, hasToken, checkSession, onSessionExpired, onAccessPassExpired, onError }: UnauthorizedInterceptorOptions) =>
  async (error: AxiosError<ApiErrorData>): Promise<never> => {
    // NOTE: Cloudflare Access, not Open WebUI, answered: the Open WebUI session is kept and only the pass is renewed.
    if (isCloudflareAccessError(error) && hasToken()) {
      onAccessPassExpired(error);

      return Promise.reject(error);
    }

    // NOTE: No token means the user is already logged out, e.g. a late 401 from a request sent before logout.
    if (
      error.response?.status !== HttpStatusCode.Unauthorized ||
      publicEndpoints.includes(error.config?.url ?? '') ||
      !hasToken()
    ) {
      return Promise.reject(error);
    }

    const isSessionExpired = isGetProfileRequest(error.config) || !(await checkSession());

    // NOTE: The user may have logged out while the session check was in flight.
    if (isSessionExpired && hasToken()) {
      onSessionExpired();
    } else if (!isSessionExpired && !error.config?.params?.skipToast) {
      onError(error);
    }

    return Promise.reject(error);
  };
