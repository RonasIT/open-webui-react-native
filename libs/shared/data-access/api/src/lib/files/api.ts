import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { FileData, FileDataContent } from '@open-webui-react-native/shared/data-access/common';
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

function useGetFileContent(
  id?: string,
  props?: UseQueryOptions<FileDataContent, AxiosError<ApiErrorData>>,
): UseQueryResult<FileDataContent, AxiosError<ApiErrorData>> {
  return useQuery<FileDataContent, AxiosError<ApiErrorData>>({
    queryFn: () => filesService.getFileContent(id!),
    queryKey: filesApiConfig.getFileContentQueryKey(id!),
    enabled: !!id,
    ...props,
  });
}

export const filesApi = {
  useUploadFile,
  useGetFileContent,
};
