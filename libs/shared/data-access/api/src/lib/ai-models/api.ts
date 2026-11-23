import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { refetchOnMountWithStaleCheck } from '@open-webui-react-native/shared/data-access/persist-query-helpers';
import { modelsApiConfig } from './config';
import { AIModel } from './models';
import { modelsService } from './service';

export function useGetModels(requestOptions?: RequestOptions): UseQueryResult<Array<AIModel>, AxiosError> {
  return useQuery<Array<AIModel>, AxiosError>({
    queryFn: () => modelsService.get(requestOptions),
    queryKey: modelsApiConfig.getModelsQueryKey,
    staleTime: 5 * 60 * 1000,
    // NOTE: The list is persisted to MMKV, so a launch within staleTime would otherwise keep a
    // model the server has since removed and the next send would ask for it. One refetch per
    // launch, then staleTime decides.
    refetchOnMount: (query) => refetchOnMountWithStaleCheck(query),
  });
}

export const modelsApi = {
  useGetModels,
};
