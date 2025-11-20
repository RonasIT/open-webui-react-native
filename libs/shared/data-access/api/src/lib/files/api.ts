import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { FileData } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { filesApiConfig } from './config';
import { filesService } from './service';

function useUploadFile(
  props?: UseMutationOptions<FileData, AxiosError<ApiErrorData>, FormData>,
): UseMutationResult<FileData, AxiosError<ApiErrorData>, FormData> {
  return useMutation<FileData, AxiosError<ApiErrorData>, FormData>({
    mutationFn: filesService.uploadFile,
    mutationKey: filesApiConfig.uploadFileQueryKey,
    ...props,
  });
}

export const filesApi = {
  useUploadFile,
};
