import { appConfigurationApi, authApi, modelsApi, usersApi } from '@open-webui-react-native/shared/data-access/api';
import { apiConfig } from '@open-webui-react-native/shared/data-access/api-client';

interface UseInitRequestsResult {
  isLoading: boolean;
}

export const useInitRequests = (): UseInitRequestsResult => {
  const requestOptions = { timeout: apiConfig.initRequestTimeout };
  const queries = [
    modelsApi.useGetModels(requestOptions),
    authApi.useGetProfile(requestOptions),
    usersApi.useGetUserSettings(requestOptions),
    appConfigurationApi.useGetAppConfiguration(undefined, requestOptions),
  ];

  // NOTE: Only the first fetch counts: without data a refetch flips the query back to `pending`, which would
  // re-show the spinner on every retry cycle and lock the user out of Settings → Logout.
  const isLoading = queries.some(({ isLoading, isFetched }) => isLoading && !isFetched);

  return { isLoading };
};
