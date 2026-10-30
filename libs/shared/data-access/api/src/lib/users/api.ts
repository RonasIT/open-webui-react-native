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
import { ApiErrorData, RequestOptions } from '@open-webui-react-native/shared/data-access/api-client';
import { createEntityApi } from '@open-webui-react-native/shared/data-access/base-entity';
import { getNextPageParam } from '@open-webui-react-native/shared/data-access/common';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ModelControlChoices } from '../ai-models/models/model-control-choices';
import { usersApiConfig } from './config';
import { UiParams, UiSettings, UserInfo, UserSettings } from './models';
import { usersService } from './service';
import { userQueriesKeys } from './user-queries-keys';
import { mergeUserSettings, restoreUserSettingsQueryData, setModelControlChoices } from './utils';

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

function useGetUserSettings(requestOptions?: RequestOptions): UseQueryResult<UserSettings, AxiosError<ApiErrorData>> {
  return useQuery<UserSettings, AxiosError<ApiErrorData>>({
    queryFn: () => usersService.getUserSettings(requestOptions),
    queryKey: usersApiConfig.getUserSettingsQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface UpdateUserSettingsContext {
  previousSettings?: UserSettings | null;
}

function useUpdateUserSettings({
  onError,
  ...props
}: UseMutationOptions<
  UserSettings,
  AxiosError<ApiErrorData>,
  UserSettings,
  UpdateUserSettingsContext
> = {}): UseMutationResult<UserSettings, AxiosError<ApiErrorData>, UserSettings, UpdateUserSettingsContext> {
  return useMutation<UserSettings, AxiosError<ApiErrorData>, UserSettings, UpdateUserSettingsContext>({
    mutationFn: usersService.updateUserSettings,
    onMutate: async (settings) => {
      await queryClient.cancelQueries({ queryKey: usersApiConfig.getUserSettingsQueryKey });

      const previousSettings = queryClient.getQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey);

      queryClient.setQueryData<UserSettings>(
        usersApiConfig.getUserSettingsQueryKey,
        mergeUserSettings(previousSettings, settings),
      );

      return { previousSettings };
    },
    onError: (error, settings, onMutateResult, context) => {
      restoreUserSettingsQueryData(onMutateResult?.previousSettings);
      onError?.(error, settings, onMutateResult, context);
    },
    ...props,
  });
}

export interface UpdateModelControlChoicesRequest {
  modelId: string;
  choices: ModelControlChoices;
}

function useUpdateModelControlChoices({
  onError,
  ...props
}: UseMutationOptions<
  UiParams,
  AxiosError<ApiErrorData>,
  UpdateModelControlChoicesRequest,
  UpdateUserSettingsContext
> = {}): UseMutationResult<
  UiParams,
  AxiosError<ApiErrorData>,
  UpdateModelControlChoicesRequest,
  UpdateUserSettingsContext
> {
  return useMutation<UiParams, AxiosError<ApiErrorData>, UpdateModelControlChoicesRequest, UpdateUserSettingsContext>({
    mutationFn: ({ modelId, choices }) => usersService.updateModelControlChoices(modelId, () => choices),
    onMutate: async ({ modelId, choices }) => {
      await queryClient.cancelQueries({ queryKey: usersApiConfig.getUserSettingsQueryKey });

      const previousSettings = queryClient.getQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey);

      queryClient.setQueryData<UserSettings>(
        usersApiConfig.getUserSettingsQueryKey,
        setModelControlChoices(previousSettings, modelId, choices),
      );

      return { previousSettings };
    },
    onError: (error, request, onMutateResult, context) => {
      restoreUserSettingsQueryData(onMutateResult?.previousSettings);
      onError?.(error, request, onMutateResult, context);
    },
    onSuccess: (params) => {
      queryClient.setQueryData<UserSettings | null>(usersApiConfig.getUserSettingsQueryKey, (current) =>
        mergeUserSettings(current, new UserSettings({ ui: new UiSettings({ params }) })),
      );
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
  useUpdateModelControlChoices,
};
