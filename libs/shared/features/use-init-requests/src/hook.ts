import { useEffect } from 'react';
import { appConfigurationApi, authApi, modelsApi, usersApi } from '@open-webui-react-native/shared/data-access/api';
import { analyticsService } from '@open-webui-react-native/shared/utils/analytics-service';

interface UseInitRequestsResult {
  isLoading: boolean;
}

export const useInitRequests = (): UseInitRequestsResult => {
  const { isLoading: isModelsLoading } = modelsApi.useGetModels();
  const { data: profile, isLoading: isProfileLoading } = authApi.useGetProfile();
  const { isLoading: isUserSettingsLoading } = usersApi.useGetUserSettings();
  const { isLoading: isConfigurationLoading } = appConfigurationApi.useGetAppConfiguration();

  const isLoading = isModelsLoading || isProfileLoading || isUserSettingsLoading || isConfigurationLoading;

  useEffect(() => {
    if (profile?.id) {
      analyticsService.setUser(profile.id);
    }
  }, [profile]);

  return { isLoading };
};
