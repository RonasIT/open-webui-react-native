import { InternalAxiosRequestConfig } from 'axios';

//NOTE: GET current user — same resource as `authService.getProfile()` (`…/v1/auths/`).
export const isGetProfileRequest = (config?: InternalAxiosRequestConfig): boolean => {
  if (!config || config.method?.toLowerCase() !== 'get') {
    return false;
  }
  const joined = `${config.baseURL ?? ''}${config.url ?? ''}`.split('?')[0];
  const path = joined.replace(/^https?:\/\/[^/]+/i, '');
  const tail = path.replace(/\/+$/, '');

  return /(^|\/)v1\/auths$/.test(tail);
};
