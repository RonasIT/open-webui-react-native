import { useMutation, UseMutationOptions, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { createEntityApi } from '@open-webui-react-native/shared/data-access/base-entity';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { usersApiConfig } from './config';
import { UserSettings } from './models';
import { usersService } from './service';
import { userQueriesKeys } from './user-queries-keys';

const baseApi = createEntityApi({
  queriesKeys: userQueriesKeys,
  entityService: usersService,
});

function useGetUserSettings(): UseQueryResult<UserSettings, AxiosError<ApiErrorData>> {
  return useQuery<UserSettings, AxiosError<ApiErrorData>>({
    queryFn: usersService.getUserSettings,
    queryKey: usersApiConfig.getUserSettingsQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface UpdateUserSettingsContext {
  previousSettings?: UserSettings;
}

function useUpdateUserSettings(
  props?: UseMutationOptions<UserSettings, AxiosError<ApiErrorData>, UserSettings, UpdateUserSettingsContext>,
): UseMutationResult<UserSettings, AxiosError<ApiErrorData>, UserSettings, UpdateUserSettingsContext> {
  return useMutation<UserSettings, AxiosError<ApiErrorData>, UserSettings, UpdateUserSettingsContext>({
    mutationFn: usersService.updateUserSettings,
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: usersApiConfig.getUserSettingsQueryKey });

      const previousSettings = queryClient.getQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey);

      queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, settings);

      return { previousSettings };
    },
    onError: (_error, _settings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, context.previousSettings);
      }
    },
    onSuccess: (settings) => {
      queryClient.setQueryData<UserSettings>(usersApiConfig.getUserSettingsQueryKey, settings);
    },
    ...props,
  });
}

export const usersApi = {
  ...baseApi,
  useGetUserSettings,
  useUpdateUserSettings,
};
