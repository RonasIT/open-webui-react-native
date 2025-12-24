import { appConfigurationApi, authApi, modelsApi, usersApi } from '@open-webui-react-native/shared/data-access/api';

interface UseInitRequestsResult {
  isLoading: boolean;
}

export const useInitRequests = (): UseInitRequestsResult => {
  const { isLoading: isModelsLoading } = modelsApi.useGetModels();
  const { isLoading: isProfileLoading } = authApi.useGetProfile();
  const { isLoading: isUserSettingsLoading } = usersApi.useGetUserSettings();
  const { isLoading: isConfigurationLoading } = appConfigurationApi.useGetAppConfiguration();

  const isLoading = isModelsLoading || isProfileLoading || isUserSettingsLoading || isConfigurationLoading;

  return { isLoading };
};
