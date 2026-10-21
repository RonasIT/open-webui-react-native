import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { modelsApiConfig } from './config';
import { AIModel } from './models';
import { modelsService } from './service';

export function useGetModels(requestOptions?: RequestOptions): UseQueryResult<Array<AIModel>, AxiosError> {
  return useQuery<Array<AIModel>, AxiosError>({
    queryFn: () => modelsService.get(requestOptions),
    queryKey: modelsApiConfig.getModelsQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const modelsApi = {
  useGetModels,
};
