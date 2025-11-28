import { useState } from 'react';
import {
  chatApi,
  chatServiceConfig,
  invalidateArchivedChatListQuery,
} from '@open-webui-react-native/shared/data-access/api';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ToastService } from '@open-webui-react-native/shared/utils/toast-service';

interface UseUnarchiveChatsResult {
  isUnarchiving: boolean;
  unarchiveAllChats: () => Promise<void>;
}

export const useUnarchiveChats = (): UseUnarchiveChatsResult => {
  const [isUnarchiving, setIsUnarchiving] = useState<boolean>(false);
  const { data } = chatApi.useGetAllArchivedChatsJson();
  const { mutateAsync } = chatApi.useUnarchiveChat(false);

  const unarchiveAllChats = async (): Promise<void> => {
    try {
      setIsUnarchiving(true);

      if (!data?.length) return;

      await Promise.all(data.map((chat) => mutateAsync(chat.id)));

      // NOTE: After unarchiving chats it moved back into pinned or regular chat list, so we need to refetch it
      queryClient.invalidateQueries({ queryKey: chatServiceConfig.getChatListQueryKey });
      queryClient.invalidateQueries({ queryKey: chatServiceConfig.getPinnedChatListQueryKey });
      queryClient.invalidateQueries({ queryKey: chatServiceConfig.getAllArchivedChatsQueryKey });
      // NOTE: Invalidate all folders chat lists with keys: foldersApiConfig.getFolderChatListQueryKey(folderId)
      queryClient.invalidateQueries({
        queryKey: ['folders', 'chat-list'],
        exact: false,
      });
      queryClient.removeQueries({
        queryKey: ['folders', 'chat-list'],
        exact: false,
        type: 'inactive',
      });
      queryClient.invalidateQueries({
        queryKey: ['folders', 'chats'],
        exact: false,
      });
      queryClient.removeQueries({
        queryKey: ['folders', 'chats'],
        exact: false,
        type: 'inactive',
      });
      invalidateArchivedChatListQuery();
    } catch {
      ToastService.showError();
    } finally {
      setIsUnarchiving(false);
    }
  };

  return {
    isUnarchiving,
    unarchiveAllChats,
  };
};
