import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { appConfigurationApiConfig } from './config';
import { Configuration } from './models';
import { appConfigurationService } from './service';
import { getConfigPath } from './utils';

type UseGetAppConfigurationResult = UseQueryResult<Configuration, AxiosError> & {
  fetchWithUrlResult: Configuration | undefined;
  fetchWithUrl: (url: string) => Promise<Configuration | undefined>;
  isFetchWithUrlSuccess: boolean;
  isFetchWithUrlError: boolean;
  isFetchWithUrlLoading: boolean;
};

export function useGetAppConfiguration(
  options?: Omit<UseQueryOptions<Configuration, AxiosError>, 'queryKey' | 'queryFn'>,
): UseGetAppConfigurationResult {
  const [fetchWithUrlResult, setFetchWithUrlResult] = useState<Configuration | undefined>();
  const [customState, setCustomState] = useState({
    isSuccess: false,
    isError: false,
    isLoading: false,
  });

  const result = useQuery<Configuration, AxiosError>({
    queryFn: () => appConfigurationService.get(),
    queryKey: appConfigurationApiConfig.getConfigQueryKey,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const fetchWithUrl = async (url: string): Promise<Configuration | undefined> => {
    try {
      const configUrl = getConfigPath(url);

      setCustomState({ isSuccess: false, isError: false, isLoading: true });
      const config = await queryClient.fetchQuery({
        queryKey: appConfigurationApiConfig.getUrlConfigQueryKey,
        queryFn: () => appConfigurationService.get(configUrl, true),
      });
      setCustomState({ isSuccess: true, isError: false, isLoading: false });
      setFetchWithUrlResult(config);

      return config;
    } catch {
      setCustomState({ isSuccess: false, isError: true, isLoading: false });
    }
  };

  return {
    ...result,
    fetchWithUrlResult,
    fetchWithUrl,
    isFetchWithUrlSuccess: customState.isSuccess,
    isFetchWithUrlError: customState.isError,
    isFetchWithUrlLoading: customState.isLoading,
  };
}

export const appConfigurationApi = {
  useGetAppConfiguration,
};
