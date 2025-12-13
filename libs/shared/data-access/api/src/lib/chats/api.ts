import { EntityPartial } from '@ronas-it/rtkq-entity-api';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryResult,
  UseQueryOptions,
  InfiniteData,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { merge } from 'lodash-es';
import { useRef } from 'react';
import { ApiErrorData } from '@open-webui-react-native/shared/data-access/api-client';
import { getNextPageParam, Role } from '@open-webui-react-native/shared/data-access/common';
import { refetchOnMountWithStaleCheck } from '@open-webui-react-native/shared/data-access/persist-query-helpers';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { useSubscribeToEvent, WebSocketEventName } from '@open-webui-react-native/shared/data-access/websocket';
import { foldersApiConfig } from '../folders';
import { archivedChatListQueryKey } from './archived-chat-list-query-keys';
import { chatQueriesKeys } from './chat-queries-keys';
import { chatServiceConfig } from './configs';
import {
  ChatListItem,
  ChatResponse,
  CompleteChatRequest,
  CompleteChatResponse,
  CompletedChat,
  CreateNewChatRequest,
  GetArchivedChatListRequest,
  MoveChatToFolderRequest,
  ShareChatResponse,
} from './models';
import { chatService } from './service';
import {
  getSearchChatsQueryKey,
  handleChatSocketEvent,
  invalidateArchivedChatListQuery,
  invalidateSearchChatsQuery,
  patchChatQueryData,
} from './utils';

function useGetChatList(): UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  const result = useInfiniteQuery({
    queryFn: ({ pageParam }) => chatService.getChatList({ page: pageParam }),
    queryKey: chatServiceConfig.getChatListQueryKey,
    initialPageParam: 1,
    refetchOnMount: (query) => refetchOnMountWithStaleCheck(query),
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: chatServiceConfig.chatsPerPage }),
    select: (data) => data.pages.flat(),
  });

  // NOTE: No need to subscribe to events in useGetPinnedChatList.
  // For example, if the user has only pinned chats, chatList will return empty (200 OK).
  // In this case, useSubscribeToEvent will be triggered.
  useSubscribeToEvent({
    event: WebSocketEventName.EVENTS,
    queryKey: chatServiceConfig.getChatListQueryKey,
    handleEvent: handleChatSocketEvent,
    isSuccess: result.isSuccess,
  });

  return result as UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>>;
}

function useGetPinnedChatList(): UseQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  const result = useQuery({
    queryFn: chatService.getPinnedChatList,
    queryKey: chatServiceConfig.getPinnedChatListQueryKey,
  });

  return result as UseQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>>;
}

function useSearchInfinite(text: string): UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  return useInfiniteQuery({
    queryFn: ({ pageParam }) => chatService.searchChatList({ page: pageParam, text }),
    // TODO: Temporary solution because useUpdate patches are broken; remove when omit endpoint logic is implemented
    queryKey: getSearchChatsQueryKey(text),
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: chatServiceConfig.chatsPerPage }),
    select: (data) => data.pages.flat(),
    staleTime: 0,
    gcTime: 0,
    meta: {
      persist: false,
    },
  });
}

function useGet(
  id: string,
  options?: Omit<UseQueryOptions<ChatResponse, AxiosError<ApiErrorData>>, 'queryKey' | 'queryFn'>,
): UseQueryResult<ChatResponse, AxiosError<ApiErrorData>> {
  const isUpdated = useRef(false);
  const queryKey = chatQueriesKeys.get(id).queryKey;

  const result = useQuery({
    queryKey,
    queryFn: () => chatService.get(id),
    ...options,
  });

  if (result.isFetching) {
    isUpdated.current = false;
  }

  if (result.isFetched && !isUpdated.current) {
    queryClient.setQueryData<ChatResponse>(queryKey, (draft) => {
      if (!draft) {
        return undefined;
      }

      const { history } = draft.chat;

      if (history.currentId) {
        for (const message of Object.values(history.messages)) {
          if (message.role === Role.ASSISTANT) {
            message.done = true;
          }
        }
      }
    });
    isUpdated.current = true;
  }

  return result;
}

export function useUpdate(
  options?: UseMutationOptions<ChatResponse, AxiosError<ApiErrorData>, EntityPartial<ChatResponse>>,
): UseMutationResult<ChatResponse, AxiosError<ApiErrorData>, EntityPartial<ChatResponse>> {
  return useMutation({
    mutationFn: (params) => chatService.update(params),
    onSuccess: (chat) => {
      // useGet query
      patchChatQueryData(chat.id, chat);

      // useGetChatList query
      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft) {
            return undefined;
          }

          let updatedItem: ChatListItem | null = null;

          const updatedPages = draft.pages.map((page) =>
            page.filter((item) => {
              if (item.id === chat.id) {
                updatedItem = merge({}, item, chat);

                return false;
              }

              return true;
            }),
          );

          if (updatedItem) {
            updatedPages[0].unshift(updatedItem);
          }

          return {
            pages: updatedPages,
            pageParams: draft.pageParams,
          };
        },
      );

      // useGetPinnedChatList query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.reduce(
          (acc, item) => (item.id === chat.id ? [merge({}, item, chat), ...acc] : [...acc, item]),
          [] as Array<ChatListItem>,
        );
      });

      invalidateSearchChatsQuery();

      // useGetFolderChatList query
      if (chat.folderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(chat.folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            let updatedItem: ChatListItem | null = null;

            const updatedPages = draft.pages.map((page) =>
              page.filter((item) => {
                if (item.id === chat.id) {
                  updatedItem = merge({}, item, chat);

                  return false;
                }

                return true;
              }),
            );

            if (updatedItem) {
              updatedPages[0].unshift(updatedItem);
            }

            return {
              pages: updatedPages,
              pageParams: draft.pageParams,
            };
          },
        );

        // useGetFolderChats query
        queryClient.setQueryData<Array<ChatResponse>>(
          foldersApiConfig.getFolderChatsQueryKey(chat.folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            return draft.reduce(
              (acc, item) => (item.id === chat.id ? [merge({}, item, chat), ...acc] : [...acc, item]),
              [] as Array<ChatResponse>,
            );
          },
        );
      }
    },
    ...options,
  });
}

export function useUpdateChatFolder(
  options?: UseMutationOptions<
    ChatResponse,
    AxiosError<ApiErrorData>,
    MoveChatToFolderRequest & { oldFolderId?: string | null }
  >,
): UseMutationResult<
  ChatResponse,
  AxiosError<ApiErrorData>,
  MoveChatToFolderRequest & { oldFolderId?: string | null }
> {
  return useMutation({
    mutationFn: (params) => chatService.updateChatFolder(params),

    onSuccess: (chat, variables) => {
      const oldFolderId = variables.oldFolderId ?? null;
      const newFolderId = chat.folderId ?? null;

      patchChatQueryData(chat.id, { folderId: newFolderId });

      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft) return;

          const pages = draft.pages.map((page) => page.filter((item) => item.id !== chat.id));

          if (!newFolderId) {
            pages[0] = [{ ...chat } as ChatListItem, ...pages[0]];
          }

          return { pages, pageParams: draft.pageParams };
        },
      );

      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) =>
        draft?.map((item) => (item.id === chat.id ? { ...item, folderId: newFolderId } : item)),
      );

      invalidateSearchChatsQuery();

      if (oldFolderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(oldFolderId),
          (draft) => {
            if (!draft) return;

            const pages = draft.pages.map((page) => page.filter((item) => item.id !== chat.id));

            return { pages, pageParams: draft.pageParams };
          },
        );
      }

      if (newFolderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(newFolderId),
          (draft) => {
            if (!draft) return;

            const pages = draft.pages.map((page) => page.filter((item) => item.id !== chat.id));

            pages[0] = [{ ...chat } as ChatListItem, ...pages[0]];

            return { pages, pageParams: draft.pageParams };
          },
        );
      }
    },

    ...options,
  });
}

export function useDelete(
  options?: UseMutationOptions<void, AxiosError<ApiErrorData>, { id: string; folderId?: string }>,
): UseMutationResult<void, AxiosError<ApiErrorData>, { id: string; folderId?: string }> {
  return useMutation({
    mutationFn: ({ id }) => chatService.delete(id),
    onSuccess: (_, { id, folderId }) => {
      // useGet query
      queryClient.removeQueries({ queryKey: chatQueriesKeys.get(id).queryKey });

      // useGetChatList query
      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft) {
            return undefined;
          }

          return {
            pages: draft.pages.map((page) => page.filter((item) => item.id !== id)),
            pageParams: draft.pageParams,
          };
        },
      );

      // useGetPinnedChatList query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.filter((item) => item.id !== id);
      });

      invalidateSearchChatsQuery();
      invalidateArchivedChatListQuery();

      // useGetFolderChatList query
      if (folderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            return {
              pages: draft.pages.map((page) => page.filter((item) => item.id !== id)),
              pageParams: draft.pageParams,
            };
          },
        );

        // useGetFolderChats query
        queryClient.setQueryData<Array<ChatResponse>>(foldersApiConfig.getFolderChatsQueryKey(folderId), (draft) => {
          if (!draft) {
            return undefined;
          }

          return draft.filter((item) => item.id !== id);
        });
      }
    },
    ...options,
  });
}

export function usePinChat(
  options?: UseMutationOptions<ChatResponse, AxiosError<ApiErrorData>, { isPinned: boolean; id: string }>,
): UseMutationResult<ChatResponse, AxiosError<ApiErrorData>, { isPinned: boolean; id: string }> {
  return useMutation<ChatResponse, AxiosError<ApiErrorData>, { isPinned: boolean; id: string }>({
    mutationFn: ({ id }) => chatService.pinChat(id),
    onSuccess: (chat, { isPinned, id }) => {
      // useGetChatList query
      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft || chat.folderId) {
            return undefined;
          }

          return {
            pages: isPinned
              ? draft.pages.map((page, index) => (index === 0 ? [chat, ...page] : page))
              : draft.pages.map((page) => page.filter((item) => item.id !== id)),
            pageParams: draft.pageParams,
          };
        },
      );

      // useGetPinnedChatList query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return isPinned ? draft.filter((item) => item.id !== id) : [new ChatListItem(chat), ...draft];
      });

      // useGetFolderChatList query
      if (chat.folderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(chat.folderId),
          (draft) => {
            if (!draft || !chat.folderId) {
              return undefined;
            }

            return {
              pages: isPinned
                ? draft.pages.map((page, index) => (index === 0 ? [chat, ...page] : page))
                : draft.pages.map((page) => page.filter((item) => item.id !== id)),
              pageParams: draft.pageParams,
            };
          },
        );

        // useGetFolderChats query
        queryClient.setQueryData<Array<ChatResponse>>(
          foldersApiConfig.getFolderChatsQueryKey(chat.folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            return isPinned ? draft.filter((item) => item.id !== id) : [chat, ...draft];
          },
        );
      }
    },
    ...options,
  });
}

export function useCloneChat(
  options?: UseMutationOptions<ChatResponse, AxiosError<ApiErrorData>, { id: string; title: string }>,
): UseMutationResult<ChatResponse, AxiosError<ApiErrorData>, { id: string; title: string }> {
  return useMutation<ChatResponse, AxiosError<ApiErrorData>, { id: string; title: string }>({
    mutationFn: ({ id, title }) => chatService.cloneChat({ chatId: id, title }),
    onSuccess: (chat, { id }) => {
      // useGetPinnedChatList query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        const originalChat = draft.find((item) => item.id === id);

        return originalChat ? [new ChatListItem(chat), ...draft] : draft;
      });

      // useGetChatList query
      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft) {
            return undefined;
          }

          const originalPage = draft.pages.find((page) => page.find((item) => item.id === id));

          return {
            pages: originalPage
              ? draft.pages.map((page, index) => (index === 0 ? [new ChatListItem(chat), ...page] : page))
              : draft.pages,
            pageParams: draft.pageParams,
          };
        },
      );

      // useGetFolders query
      if (chat.folderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(chat.folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            const originalPage = draft.pages.find((page) => page.find((item) => item.id === id));

            return {
              pages: originalPage
                ? draft.pages.map((page, index) => (index === 0 ? [new ChatListItem(chat), ...page] : page))
                : draft.pages,
              pageParams: draft.pageParams,
            };
          },
        );

        // useGetFolderChats query
        queryClient.setQueryData<Array<ChatResponse>>(
          foldersApiConfig.getFolderChatsQueryKey(chat.folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            return [chat, ...draft];
          },
        );
      }
    },
    ...options,
  });
}

function useCreateNewChat(
  options?: UseMutationOptions<ChatResponse, AxiosError, CreateNewChatRequest>,
): UseMutationResult<ChatResponse, AxiosError, CreateNewChatRequest> {
  return useMutation({
    mutationFn: (params) => chatService.createNewChat(params),
    onSuccess: () => {
      invalidateSearchChatsQuery();
    },
    ...options,
  });
}

function useCompleteChat(
  options?: UseMutationOptions<CompleteChatResponse, AxiosError, CompleteChatRequest>,
): UseMutationResult<CompleteChatResponse, AxiosError, CompleteChatRequest> {
  return useMutation({
    mutationFn: (params) => chatService.completeChat(params),
    ...options,
  });
}

function useCompletedChat(
  options?: UseMutationOptions<CompletedChat, AxiosError, CompletedChat>,
): UseMutationResult<CompletedChat, AxiosError, CompletedChat> {
  return useMutation({
    mutationFn: (params) => chatService.handleCompletedChat(params),
    ...options,
  });
}

function useShareChat({
  onSuccess,
  ...options
}: UseMutationOptions<ShareChatResponse, AxiosError, string>): UseMutationResult<
  ShareChatResponse,
  AxiosError,
  string
> {
  return useMutation<ShareChatResponse, AxiosError, string, unknown>({
    mutationFn: (chatId) => chatService.shareChat(chatId),
    onSuccess: (response, chatId, context) => {
      onSuccess?.(response, chatId, context);
      patchChatQueryData(chatId, { shareId: response.id });
    },
    ...options,
  });
}

function useDeleteShareChatLink(
  options?: UseMutationOptions<void, AxiosError, string>,
): UseMutationResult<void, AxiosError, string> {
  return useMutation<void, AxiosError, string, unknown>({
    mutationFn: (chatId) => chatService.deleteShareChatLink(chatId),
    onSuccess: (_, chatId) => {
      patchChatQueryData(chatId, { shareId: null });
    },
    ...options,
  });
}

function useArchiveChat(
  options?: UseMutationOptions<ChatResponse, AxiosError, { id: string; folderId?: string }>,
): UseMutationResult<ChatResponse, AxiosError, { id: string; folderId?: string }> {
  return useMutation<ChatResponse, AxiosError, { id: string; folderId?: string }, unknown>({
    mutationFn: ({ id }) => chatService.archiveChat(id),
    onSuccess: (_, { id, folderId }) => {
      // useGetChatList query
      queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
        chatServiceConfig.getChatListQueryKey,
        (draft) => {
          if (!draft) {
            return undefined;
          }

          return {
            pages: draft.pages.map((page) => page.filter((item) => item.id !== id)),
            pageParams: draft.pageParams,
          };
        },
      );

      // useGetPinnedChatList query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getPinnedChatListQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.filter((item) => item.id !== id);
      });

      // useGetAllArchivedChatsJson query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getAllArchivedChatsQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return [new ChatListItem({ id }), ...draft];
      });

      // useGetFolders query
      if (folderId) {
        queryClient.setQueryData<InfiniteData<Array<ChatListItem>, number>>(
          foldersApiConfig.getFolderChatListQueryKey(folderId),
          (draft) => {
            if (!draft) {
              return undefined;
            }

            return {
              pages: draft.pages.map((page) => page.filter((item) => item.id !== id)),
              pageParams: draft.pageParams,
            };
          },
        );

        // useGetFolderChats query
        queryClient.setQueryData<Array<ChatResponse>>(foldersApiConfig.getFolderChatsQueryKey(folderId), (draft) => {
          if (!draft) {
            return undefined;
          }

          return draft.filter((item) => item.id !== id);
        });
      }

      const queryCache = queryClient.getQueryCache();
      const searchInfiniteLiveQueries = queryCache.findAll({
        queryKey: archivedChatListQueryKey.searchInfinite().queryKey,
      });
      searchInfiniteLiveQueries.forEach((query) => {
        queryClient.removeQueries({ queryKey: query.queryKey, type: 'all' });
      });
    },
    ...options,
  });
}

function useUnarchiveChat(
  isSingleChat: boolean = true,
  options?: UseMutationOptions<ChatResponse, AxiosError, string>,
): UseMutationResult<ChatResponse, AxiosError, string> {
  return useMutation<ChatResponse, AxiosError, string, unknown>({
    mutationFn: (chatId) => chatService.archiveChat(chatId),
    onSuccess: (chat, chatId) => {
      if (!isSingleChat) return;

      // useGetAllArchivedChatsJson query
      queryClient.setQueryData<Array<ChatListItem>>(chatServiceConfig.getAllArchivedChatsQueryKey, (draft) => {
        if (!draft) {
          return undefined;
        }

        return draft.filter((item) => item.id !== chatId);
      });
      invalidateArchivedChatListQuery();
      queryClient.invalidateQueries({ queryKey: chatServiceConfig.getChatListQueryKey });
      queryClient.invalidateQueries({ queryKey: chatServiceConfig.getPinnedChatListQueryKey });

      if (chat.folderId) {
        queryClient.invalidateQueries({ queryKey: foldersApiConfig.getFolderChatListQueryKey(chat.folderId) });
        queryClient.removeQueries({
          queryKey: foldersApiConfig.getFolderChatListQueryKey(chat.folderId),
          type: 'inactive',
        });

        queryClient.invalidateQueries({ queryKey: foldersApiConfig.getFolderChatsQueryKey(chat.folderId) });
        queryClient.removeQueries({
          queryKey: foldersApiConfig.getFolderChatsQueryKey(chat.folderId),
          type: 'inactive',
        });
      }
    },
    ...options,
  });
}

function useGetArchivedChatList(
  params: Omit<GetArchivedChatListRequest, 'page'>,
): UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  const result = useInfiniteQuery({
    queryFn: ({ pageParam }) => chatService.getArchivedChatList({ page: pageParam, ...params }),
    queryKey: archivedChatListQueryKey.searchInfinite(params).queryKey,
    initialPageParam: 1,
    getNextPageParam: (lastPage, result, lastPageParam) =>
      getNextPageParam({ lastPage, result, lastPageParam, itemsPerPage: chatServiceConfig.chatsPerPage }),
    select: (data) => data.pages.flat(),
    gcTime: 0,
    staleTime: 0,
    meta: {
      persist: false,
    },
  });

  return result as UseInfiniteQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>>;
}

export function useGetAllArchivedChatsJson(): UseQueryResult<Array<ChatListItem>, AxiosError<ApiErrorData>> {
  return useQuery({
    queryKey: chatServiceConfig.getAllArchivedChatsQueryKey,
    queryFn: chatService.getAllArchivedChats,
  });
}

export const chatApi = {
  useGet,
  useUpdate,
  useDelete,
  usePinChat,
  useCloneChat,
  useGetChatList,
  useGetPinnedChatList,
  useSearchInfinite,
  useCreateNewChat,
  useCompleteChat,
  useCompletedChat,
  useShareChat,
  useDeleteShareChatLink,
  useArchiveChat,
  useUnarchiveChat,
  useGetArchivedChatList,
  useGetAllArchivedChatsJson,
  useUpdateChatFolder,
};
