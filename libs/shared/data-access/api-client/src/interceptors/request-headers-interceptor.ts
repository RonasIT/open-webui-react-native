import { InternalAxiosRequestConfig } from 'axios';

import { getRequestHeaders } from '../utils/get-request-headers';

// NOTE: Matches axios: `//host` is already absolute. Joining it to the base would attach the token to a request that leaves the server.
const isAxiosAbsoluteUrl = (url: string): boolean => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

// NOTE: A relative path has no host, so it is resolved with this instance's base URL. The token is added
// only when that host is the saved server. A URL check of an address that is not saved yet stays without it.
export const requestHeadersInterceptor =
  (serverUrl: string): ((request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) =>
  (request): InternalAxiosRequestConfig => {
    const url = request.url ?? '';
    const requestUrl = isAxiosAbsoluteUrl(url) ? url : serverUrl;
    const headers = getRequestHeaders(requestUrl);

    if (headers && request.headers) {
      for (const [name, value] of Object.entries(headers)) {
        request.headers.set(name, value);
      }
    }

    return request;
  };
