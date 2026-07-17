import { ApiRequest } from '@open-webui-react-native/shared/data-access/nitro-api-client';

//NOTE: GET current user — same resource as `authService.getProfile()` (`…/v1/auths/`).
export const isGetProfileRequest = (request: ApiRequest): boolean => {
  if (request.method !== 'GET') {
    return false;
  }

  const path = request.endpoint.split('?')[0].replace(/\/+$/, '');

  return /(^|\/)v1\/auths$/.test(path);
};
