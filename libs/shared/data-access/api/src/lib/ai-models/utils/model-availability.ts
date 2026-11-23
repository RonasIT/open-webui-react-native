import { i18n } from '@ronas-it/react-native-common-modules/i18n';
import { HttpStatusCode, isAxiosError } from 'axios';
import { ApiErrorData, modelNotFoundDetail } from '@open-webui-react-native/shared/data-access/api-client';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';
import { modelsApiConfig } from '../config';
import { AIModel } from '../models';
import { unavailableModelsState$ } from '../state';

const isModelListed = (models: Array<AIModel>, modelId: string): boolean =>
  models.some((model) => model.id === modelId);

export const markModelUnavailable = (modelId: string): void => {
  unavailableModelsState$[modelId].set(true);
};

export const isModelNotFoundError = (error: unknown): boolean =>
  isAxiosError<ApiErrorData>(error) &&
  error.response?.status === HttpStatusCode.BadRequest &&
  error.response.data?.detail === modelNotFoundDetail;

const isModelSendBlocked = (modelId: string): boolean => {
  if (unavailableModelsState$[modelId].peek()) {
    return true;
  }

  const models = queryClient.getQueryData<Array<AIModel>>(modelsApiConfig.getModelsQueryKey);

  // NOTE: Until the list has arrived, the screen is still loading and nothing is sent.
  if (!models) {
    return false;
  }

  return !isModelListed(models, modelId);
};

export const refuseUnavailableModel = (modelId: string): boolean => {
  if (!isModelSendBlocked(modelId)) {
    return false;
  }

  ToastService.showError(i18n.t('SHARED.API_ERRORS.TEXT_MODEL_UNAVAILABLE'));

  return true;
};
