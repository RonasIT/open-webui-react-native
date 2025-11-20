import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { AxiosError, HttpStatusCode } from 'axios';
import { ApiErrorData } from '../types';

const errorMessageMapping = {
  [HttpStatusCode.Forbidden]: 'SHARED.API_ERRORS.TEXT_FORBIDDEN_ERROR',
  [HttpStatusCode.InternalServerError]: 'SHARED.API_ERRORS.TEXT_INTERNAL_SERVER_ERROR',
  [HttpStatusCode.NotFound]: 'SHARED.API_ERRORS.TEXT_NOT_FOUND_ERROR',
};

const getErrorMessageFromData = (data: ApiErrorData): string | undefined => {
  switch (true) {
    case typeof data.detail === 'string':
      return data.detail;
    case Array.isArray(data.detail) && data.detail.length > 0:
      return data.detail[0].msg;
    default:
      return undefined;
  }
};

const getErrorMessage = (data?: ApiErrorData, status?: number): string => {
  const errorMessageByData = data && getErrorMessageFromData(data);

  if (errorMessageByData) {
    return errorMessageByData;
  }

  if (status && status in errorMessageMapping) {
    return i18n.t(errorMessageMapping[status as keyof typeof errorMessageMapping]);
  }

  return i18n.t('SHARED.API_ERRORS.TEXT_SOMETHING_WENT_WRONG');
};

export const errorCatcherInterceptor =
  (options: { onError: (message: string) => void }) =>
  (error: AxiosError<ApiErrorData>): Promise<never> => {
    const skipToast = error.config?.params?.skipToast as boolean | undefined;
    const data = error.response?.data as ApiErrorData | undefined;
    const status = error.response?.status;

    const message =
      data || status ? getErrorMessage(data, status) : i18n.t('SHARED.API_ERRORS.TEXT_SOMETHING_WENT_WRONG');

    const isNetworkError = error.message === 'Network error' || !error.response;

    if (status !== HttpStatusCode.Unauthorized && !skipToast && !isNetworkError) {
      options.onError(message);
    }

    return Promise.reject(error);
  };
