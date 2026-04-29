import { AxiosError, HttpStatusCode } from 'axios';
import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { isGetProfileRequest } from '../utils/is-get-profile-request';

export const profileNotFoundInterceptor =
  () =>
  (error: AxiosError): Promise<never> => {
    if (error.response?.status === HttpStatusCode.NotFound && isGetProfileRequest(error.config)) {
      authState$.isUnauthorized.set(true);
    }

    return Promise.reject(error);
  };
