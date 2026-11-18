import { InternalAxiosRequestConfig } from 'axios';

import { getRequestHeaders } from '../utils/get-request-headers';

// NOTE: Matches axios: `//host` is already absolute. Joining it to the base would attach the token to a request that leaves the server.
const isAxiosAbsoluteUrl = (url: string): boolean => /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);

// NOTE: A relative path has no host, so it is resolved with this instance's base URL. The headers are added
// only when the request stays on that server, which is the saved one or the one a URL check reaches.
export const requestHeadersInterceptor =
  (serverUrl: string): ((request: InternalAxiosRequestConfig) => InternalAxiosRequestConfig) =>
  (request): InternalAxiosRequestConfig => {
    const url = request.url ?? '';
    const requestUrl = isAxiosAbsoluteUrl(url) ? url : serverUrl;
    const headers = getRequestHeaders(requestUrl, serverUrl);

    if (headers && request.headers) {
      for (const [name, value] of Object.entries(headers)) {
        request.headers.set(name, value);
      }
    }

    return request;
  };
