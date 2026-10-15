import * as Sentry from '@sentry/react-native';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
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
  fetchWithUrlError: AxiosError | undefined;
};

export function useGetAppConfiguration(
  options?: Omit<UseQueryOptions<Configuration, AxiosError>, 'queryKey' | 'queryFn'>,
): UseGetAppConfigurationResult {
  const [fetchWithUrlResult, setFetchWithUrlResult] = useState<Configuration | undefined>();
  const [customState, setCustomState] = useState<{
    isSuccess: boolean;
    isError: boolean;
    isLoading: boolean;
    error?: AxiosError;
  }>({
    isSuccess: false,
    isError: false,
    isLoading: false,
  });
  const latestFetchUrlRef = useRef<string>(undefined);

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
    const configUrl = getConfigPath(url);
    const isLatestFetch = (): boolean => latestFetchUrlRef.current === url;

    latestFetchUrlRef.current = url;
    setCustomState({ isSuccess: false, isError: false, isLoading: true });

    try {
      const config = await queryClient.fetchQuery({
        queryKey: appConfigurationApiConfig.getUrlConfigQueryKey(configUrl),
        queryFn: () =>
          appConfigurationService.get(configUrl, true, true, appConfigurationApiConfig.urlConfigRequestTimeout),
        meta: { persist: false },
      });

      if (!isLatestFetch()) {
        return;
      }

      setCustomState({ isSuccess: true, isError: false, isLoading: false });
      setFetchWithUrlResult(config);

      return config;
    } catch (error) {
      if (isLatestFetch()) {
        setCustomState({ isSuccess: false, isError: true, isLoading: false, error: error as AxiosError });
      }
    }
  };

  useEffect(() => {
    if (result.isSuccess) {
      Sentry.setTag('api.version', result.data?.version);
    }
  }, [result.isSuccess, result.data?.version]);

  return {
    ...result,
    fetchWithUrlResult,
    fetchWithUrl,
    isFetchWithUrlSuccess: customState.isSuccess,
    isFetchWithUrlError: customState.isError,
    isFetchWithUrlLoading: customState.isLoading,
    fetchWithUrlError: customState.error,
  };
}

export const appConfigurationApi = {
  useGetAppConfiguration,
};
