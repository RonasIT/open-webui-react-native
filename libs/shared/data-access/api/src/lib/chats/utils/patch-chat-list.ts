import { InfiniteData } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { foldersApiConfig } from '../../folders/config';
import { chatServiceConfig } from '../configs';
import { ChatListItem, ChatResponse } from '../models';

interface Item {
  id: string;
  title?: string;
  updatedAt?: dayjs.Dayjs;
}

export const patchChatList = ({
  id,
  title,
  createdAt,
  updatedAt,
  folderId,
}: Required<Pick<ChatListItem, 'id'>> & Partial<ChatListItem> & { folderId?: string | null }): void => {
  const queryCache = queryClient.getQueryCache();
  const patch = <T extends Item>(chat: T): T =>
    chat.id === id
      ? {
          ...chat,
          title: title ?? chat.title,
          updatedAt: updatedAt ?? chat.updatedAt,
        }
      : chat;

  // Create chat in useGetFolderChatList and useGetFolderChats
  if (folderId) {
    queryClient.setQueryData<InfiniteData<Array<ChatListItem>>>(
      foldersApiConfig.getFolderChatListQueryKey(folderId),
      (draft) =>
        draft && {
          ...draft,
          pages: draft.pages.map((page, index) =>
            createdAt && index === 0
              ? [
                  {
                    id,
                    title: title ?? '',
                    createdAt,
                    updatedAt: updatedAt ?? dayjs(),
                  },
                  ...page,
                ]
              : page,
          ),
        },
    );

    queryClient.setQueryData<Array<ChatResponse>>(foldersApiConfig.getFolderChatsQueryKey(folderId), (draft) => {
      return [
        new ChatResponse({ id, title: title ?? '', createdAt, updatedAt: updatedAt ?? dayjs() }),
        ...(draft || []),
      ];
    });
  }

  // Update chat in useGetFolderChatList and useGetFolderChats
  const folderChatListQueries = queryCache.findAll({ queryKey: ['folders', 'chat-list'], exact: false });
  const folderChatsQueries = queryCache.findAll({ queryKey: ['folders', 'chats'], exact: false });

  folderChatListQueries.forEach(({ queryKey }) => {
    queryClient.setQueryData<InfiniteData<Array<ChatListItem>>>(
      queryKey,
      (draft) =>
        draft && {
          ...draft,
          pages: draft.pages.map((page) => page.map(patch)),
        },
    );
  });

  folderChatsQueries.forEach(({ queryKey }) => {
    queryClient.setQueryData<Array<ChatResponse>>(queryKey, (draft) => draft?.map(patch) ?? draft);
  });

  // Update chat in useGetPinnedChatList
  queryClient.setQueryData<Array<ChatListItem>>(
    chatServiceConfig.getPinnedChatListQueryKey,
    (draft) => draft?.map(patch) ?? draft,
  );

  // Create and update chat in useGetChatList
  queryClient.setQueryData<InfiniteData<Array<ChatListItem>>>(
    chatServiceConfig.getChatListQueryKey,
    (draft) =>
      draft && {
        ...draft,
        pages: draft.pages.map((page, index) =>
          createdAt && index === 0 && !folderId
            ? [
                {
                  id,
                  title: title ?? '',
                  createdAt,
                  updatedAt: updatedAt ?? dayjs(),
                },
                ...page,
              ]
            : page.map(patch),
        ),
      },
  );
};
