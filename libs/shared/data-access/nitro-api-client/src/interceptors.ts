import { ApiError } from './api-error';
import { ErrorInterceptor, RequestInterceptor } from './types';

export const tokenInterceptor = (options: { getToken: () => string }): RequestInterceptor => {
  return (request) => {
    const token = options.getToken();

    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }

    return request;
  };
};

export const unauthorizedInterceptor = (options: {
  publicEndpoints: Array<string>;
  onError: (error: ApiError) => void;
}): ErrorInterceptor => {
  return (error) => {
    if (error.response?.status === 401 && !options.publicEndpoints.includes(error.request.endpoint)) {
      options.onError(error);
    }
  };
};
