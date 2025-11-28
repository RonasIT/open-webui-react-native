import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { createEntityApi } from '@open-webui-react-native/shared/data-access/base-entity';
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

export const usersApi = {
  ...baseApi,
  useGetUserSettings,
};
