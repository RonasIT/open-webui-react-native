import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { ApiError, ErrorInterceptor } from '@open-webui-react-native/shared/data-access/nitro-api-client';
import { ApiErrorData } from '../types';

const errorMessageMapping: Record<number, string> = {
  403: 'SHARED.API_ERRORS.TEXT_FORBIDDEN_ERROR',
  404: 'SHARED.API_ERRORS.TEXT_NOT_FOUND_ERROR',
  500: 'SHARED.API_ERRORS.TEXT_INTERNAL_SERVER_ERROR',
};

const getErrorMessageFromData = (data?: ApiErrorData): string | undefined => {
  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail[0].msg;
  }

  return undefined;
};

const getErrorMessage = (data?: ApiErrorData, status?: number): string => {
  const messageFromData = getErrorMessageFromData(data);

  if (messageFromData) {
    return messageFromData;
  }

  if (status && errorMessageMapping[status]) {
    return i18n.t(errorMessageMapping[status]);
  }

  return i18n.t('SHARED.API_ERRORS.TEXT_SOMETHING_WENT_WRONG');
};

export const errorCatcherInterceptor = (options: { onError: (message: string) => void }): ErrorInterceptor => {
  return (error: ApiError) => {
    const skipToast = error.request.params?.['skipToast'] as boolean | undefined;
    const isNetworkError = !error.response;
    const isUnauthorizedError = error.response?.status === 401;

    if (isNetworkError || isUnauthorizedError || skipToast) {
      return;
    }

    const data = error.response?.data as ApiErrorData | undefined;

    options.onError(getErrorMessage(data, error.response?.status));
  };
};
