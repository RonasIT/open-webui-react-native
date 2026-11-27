import * as Sentry from '@sentry/react-native';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { ApiErrorData, RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { refetchOnMountWithStaleCheck } from '@open-webui-react-native/shared/data-access/persist-query-helpers';
import { appConfigurationApiConfig } from './config';
import { Configuration } from './models';
import { appConfigurationService } from './service';
import { getConfigPath } from './utils';

const configStaleTime = 5 * 60 * 1000;

export function useGetAppConfiguration(
  options?: Omit<UseQueryOptions<Configuration, AxiosError>, 'queryKey' | 'queryFn'>,
  requestOptions?: RequestOptions,
): UseQueryResult<Configuration, AxiosError> {
  const result = useQuery<Configuration, AxiosError>({
    queryFn: () => appConfigurationService.get(requestOptions),
    queryKey: appConfigurationApiConfig.getConfigQueryKey,
    staleTime: configStaleTime,
    // NOTE: The cache is persisted to MMKV, so without this a launch within `staleTime` of the last
    // fetch would run entirely on the restored config — an admin flipping a feature flag would not
    // reach the app for up to five minutes. `refetchedQueries` lives in memory only, so this
    // guarantees exactly one refetch per launch and leaves `staleTime` in charge afterwards.
    refetchOnMount: (query) => refetchOnMountWithStaleCheck(query),
    ...options,
  });

  useEffect(() => {
    if (result.isSuccess) {
      Sentry.setTag('api.version', result.data?.version);
    }
  }, [result.isSuccess, result.data?.version]);

  return result;
}

// NOTE: The config of a server given by its URL, before or right after it is saved: the connect screen checks it,
// the sign-in screen reads the checked result from the cache.
export function useGetServerConfiguration(
  serverUrl: string,
  options?: Omit<UseQueryOptions<Configuration, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<Configuration, AxiosError<ApiErrorData>> {
  const configUrl = getConfigPath(serverUrl);

  return useQuery<Configuration, AxiosError<ApiErrorData>>({
    queryFn: () =>
      appConfigurationService.get({
        url: configUrl,
        skipToast: true,
        skipSentryReport: true,
        timeout: appConfigurationApiConfig.urlConfigRequestTimeout,
      }),
    queryKey: appConfigurationApiConfig.getUrlConfigQueryKey(configUrl),
    staleTime: configStaleTime,
    // NOTE: A wrong address is not transient: retries would only delay its error.
    retry: false,
    meta: { persist: false },
    ...options,
  });
}

export const appConfigurationApi = {
  useGetAppConfiguration,
  useGetServerConfiguration,
};
