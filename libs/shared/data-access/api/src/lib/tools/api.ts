import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { toolsApiConfig } from './config';
import { Tool } from './models';
import { toolsService } from './service';

function useGetTools(
  props?: Partial<UseQueryOptions<Array<Tool>, AxiosError<ApiErrorData>>>,
): UseQueryResult<Array<Tool>, AxiosError<ApiErrorData>> {
  return useQuery<Array<Tool>, AxiosError<ApiErrorData>>({
    queryFn: toolsService.getTools,
    queryKey: toolsApiConfig.getToolsQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // A server without tools support answers with an error, and retrying it on every chat screen
    // would achieve nothing.
    retry: false,
    ...props,
  });
}

export const toolsApi = {
  useGetTools,
};
