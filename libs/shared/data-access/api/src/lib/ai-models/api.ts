import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { modelsApiConfig } from './config';
import { AIModel } from './models';
import { modelsService } from './service';

export function useGetModels(): UseQueryResult<Array<AIModel>, AxiosError> {
  return useQuery<Array<AIModel>, AxiosError>({
    queryFn: modelsService.get,
    queryKey: modelsApiConfig.getModelsQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const modelsApi = {
  useGetModels,
};
