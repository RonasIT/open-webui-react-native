import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { createEntityApi } from '@open-webui-react-native/shared/data-access/base-entity';
import { getNextPageParam } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { usersApiConfig } from './config';
import { UserInfo, UserSettings } from './models';
import { usersService } from './service';
import { userQueriesKeys } from './user-queries-keys';

const baseApi = createEntityApi({
  queriesKeys: userQueriesKeys,
  entityService: usersService,
});

function useSearchUsers(query: string): UseInfiniteQueryResult<Array<UserInfo>, AxiosError<ApiErrorData>> {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => usersService.searchUsers({ query, page: pageParam }),
    queryKey: usersApiConfig.searchUsersQueryKey(query),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({
        lastPage: lastPage.users,
        result: result.map((page) => page.users),
        lastPageParam,
        itemsPerPage: usersApiConfig.usersPerPage,
      }),
    select: (data) => data.pages.flatMap((page) => page.users),
  });
}

function useGetUserInfo(
  id: string,
  props?: Omit<UseQueryOptions<UserInfo, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<UserInfo, AxiosError<ApiErrorData>> {
  return useQuery<UserInfo, AxiosError<ApiErrorData>>({
    queryFn: () => usersService.getUserInfo(id),
    queryKey: usersApiConfig.getUserInfoQueryKey(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...props,
  });
}

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
  useSearchUsers,
  useGetUserInfo,
  useGetUserSettings,
  useUpdateUserSettings,
};
