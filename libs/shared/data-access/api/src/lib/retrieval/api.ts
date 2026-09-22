import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { retrievalApiConfig } from './config';
import { ProcessUrlRequest, ProcessUrlResponse } from './models';
import { retrievalService } from './service';

function useProcessUrl(
  props?: UseMutationOptions<ProcessUrlResponse, AxiosError<ApiErrorData>, ProcessUrlRequest>,
): UseMutationResult<ProcessUrlResponse, AxiosError<ApiErrorData>, ProcessUrlRequest> {
  return useMutation<ProcessUrlResponse, AxiosError<ApiErrorData>, ProcessUrlRequest>({
    mutationFn: retrievalService.processUrl,
    mutationKey: retrievalApiConfig.processUrlQueryKey,
    ...props,
  });
}

export const retrievalApi = {
  useProcessUrl,
};
