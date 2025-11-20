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
import { merge } from 'lodash-es';
import { ApiErrorData } from '@open-web-ui-mobile-client-react-native/shared/data-access/api-client';
import { getNextPageParam } from '@open-web-ui-mobile-client-react-native/shared/data-access/common';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { ChatListItem } from '../chats/models/chat-list-item';
import { ChatResponse } from '../chats/models/chat-response';
import { foldersApiConfig } from './config';
import { CreateFolderRequest, FolderListItem, FolderResponse, UpdateFolderRequest } from './models';
import { foldersService } from './service';

function useGetFolder(
  id: string,
  props?: Omit<UseQueryOptions<FolderResponse, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<FolderResponse, AxiosError<ApiErrorData>> {
  return useQuery<FolderResponse, AxiosError<ApiErrorData>>({
    queryFn: () => foldersService.get(id),
    queryKey: foldersApiConfig.getFolderQueryKey(id),
    ...props,
  });
}

function useCreateFolder(
  props?: UseMutationOptions<FolderListItem, AxiosError<ApiErrorData>, CreateFolderRequest>,
): UseMutationResult<FolderListItem, AxiosError<ApiErrorData>, CreateFolderRequest> {
  return useMutation<FolderListItem, AxiosError<ApiErrorData>, CreateFolderRequest>({
    mutationFn: foldersService.createFolder,
    mutationKey: foldersApiConfig.createFolderQueryKey,
    onSuccess: (folder) => {
      queryClient.setQueryData<Array<FolderListItem>>(foldersApiConfig.getFoldersQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return [folder, ...draft];
      });
    },
    ...props,
  });
}

function useUpdateFolder(
  props?: UseMutationOptions<FolderResponse, AxiosError<ApiErrorData>, UpdateFolderRequest>,
): UseMutationResult<FolderResponse, AxiosError<ApiErrorData>, UpdateFolderRequest> {
  return useMutation<FolderResponse, AxiosError<ApiErrorData>, UpdateFolderRequest>({
    mutationFn: foldersService.updateFolder,
    mutationKey: foldersApiConfig.updateFolderQueryKey,
    onSuccess: (response) => {
      queryClient.setQueryData<Array<FolderListItem>>(foldersApiConfig.getFoldersQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.map((folder) => (folder.id === response.id ? merge({}, folder, response) : folder));
      });

      queryClient.setQueryData<FolderResponse>(foldersApiConfig.getFolderQueryKey(response.id), (draft) => {
        if (!draft) {
          return undefined;
        }

        return merge({}, draft, response);
      });
    },
    ...props,
  });
}

function useDeleteFolder(
  props?: UseMutationOptions<void, AxiosError<ApiErrorData>, string>,
): UseMutationResult<void, AxiosError<ApiErrorData>, string> {
  return useMutation<void, AxiosError<ApiErrorData>, string>({
    mutationFn: (id) => foldersService.delete(id),
    mutationKey: foldersApiConfig.deleteFolderQueryKey,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Array<FolderListItem>>(foldersApiConfig.getFoldersQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.filter((folder) => folder.id !== id);
      });
    },
    ...props,
  });
}

function useGetFolders(
  props?: UseQueryOptions<Array<FolderListItem>, AxiosError<ApiErrorData>>,
): UseQueryResult<Array<FolderListItem>, AxiosError<ApiErrorData>> {
  return useQuery<Array<FolderListItem>, AxiosError<ApiErrorData>>({
    queryFn: foldersService.getFolders,
    queryKey: foldersApiConfig.getFoldersQueryKey,
    ...props,
  });
}

function useGetFolderChatList(folderId: string): UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => foldersService.getFolderChatList({ folderId, page: pageParam }),
    queryKey: foldersApiConfig.getFolderChatListQueryKey(folderId),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: foldersApiConfig.chatsPerPage }),
    select: (data) => data.pages.flat(),
    meta: {
      shouldThrottleRefetch: true,
    },
  });
}

function useGetFolderChats(
  folderId: string,
  props?: Omit<UseQueryOptions<Array<ChatResponse>, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<Array<ChatResponse>, AxiosError<ApiErrorData>> {
  return useQuery<Array<ChatResponse>, AxiosError<ApiErrorData>>({
    queryFn: () => foldersService.getFolderChats(folderId),
    queryKey: foldersApiConfig.getFolderChatsQueryKey(folderId),
    ...props,
  });
}

export const foldersApi = {
  useGetFolder,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useGetFolders,
  useGetFolderChatList,
  useGetFolderChats,
};
