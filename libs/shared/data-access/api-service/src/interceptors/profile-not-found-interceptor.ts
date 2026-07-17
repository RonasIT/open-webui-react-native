import { authState$ } from '@open-webui-react-native/shared/data-access/auth';
import { ApiError, ErrorInterceptor } from '@open-webui-react-native/shared/data-access/nitro-api-client';
import { isGetProfileRequest } from '../utils/is-get-profile-request';

export const profileNotFoundInterceptor = (): ErrorInterceptor => {
  return (error: ApiError) => {
    if (error.response?.status === 404 && isGetProfileRequest(error.request)) {
      authState$.isUnauthorized.set(true);
    }
  };
};
