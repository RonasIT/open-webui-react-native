import { HttpStatusCode, isAxiosError } from 'axios';
import { ApiErrorData, modelNotFoundDetail } from '@open-webui-react-native/shared/data-access/api-client';

export const isModelNotFoundError = (error: unknown): boolean =>
  isAxiosError<ApiErrorData>(error) &&
  error.response?.status === HttpStatusCode.BadRequest &&
  error.response.data?.detail === modelNotFoundDetail;
