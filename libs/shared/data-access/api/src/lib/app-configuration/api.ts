import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { refetchOnMountWithStaleCheck } from '@open-webui-react-native/shared/data-access/persist-query-helpers';
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
    // NOTE: The cache is persisted to MMKV, so without this a launch within `staleTime` of the last
    // fetch would run entirely on the restored config — an admin flipping a feature flag would not
    // reach the app for up to five minutes. `refetchedQueries` lives in memory only, so this
    // guarantees exactly one refetch per launch and leaves `staleTime` in charge afterwards.
    refetchOnMount: (query) => refetchOnMountWithStaleCheck(query),
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
