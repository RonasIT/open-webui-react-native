import { AxiosError, HttpStatusCode } from 'axios';
import { ApiErrorData } from '../types';
import { isGetProfileRequest } from '../utils/is-get-profile-request';

type UnauthorizedInterceptorOptions = {
  publicEndpoints: Array<string>;
  hasToken: () => boolean;
  // Resolves to false only when the session itself is invalid.
  checkSession: () => Promise<boolean>;
  onSessionExpired: () => void;
  onError: (error: AxiosError<ApiErrorData>) => void;
};

// NOTE: Open WebUI also answers 401 for a valid session when a chat is missing or not owned by the user,
// or a permission is off, so a 401 alone does not mean the session expired. Only `GET v1/auths/` is trusted.
export const unauthorizedInterceptor =
  ({ publicEndpoints, hasToken, checkSession, onSessionExpired, onError }: UnauthorizedInterceptorOptions) =>
  async (error: AxiosError<ApiErrorData>): Promise<never> => {
    // NOTE: No token means the user is already logged out, e.g. a late 401 from a request sent before logout.
    if (
      error.response?.status !== HttpStatusCode.Unauthorized ||
      publicEndpoints.includes(error.config?.url ?? '') ||
      !hasToken()
    ) {
      return Promise.reject(error);
    }

    if (isGetProfileRequest(error.config) || !(await checkSession())) {
      onSessionExpired();
    } else if (!error.config?.params?.skipToast) {
      onError(error);
    }

    return Promise.reject(error);
  };
