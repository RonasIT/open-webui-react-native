import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ChatEventBase, ChatStatusData } from '@open-webui-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';

export const handleChatStatusEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const { chatId, messageId } = socketResponse;
  const socketData = plainToInstance(ChatStatusData, socketResponse.data.data);

  const queryKey = chatQueriesKeys.get(chatId).queryKey;

  queryClient.setQueryData(queryKey, (draft: ChatResponse) => {
    if (!draft) return;

    return {
      ...draft,
      chat: {
        ...draft.chat,
        history: {
          ...draft.chat.history,
          messages: {
            ...draft.chat.history.messages,
            [messageId]: {
              ...draft.chat.history.messages[messageId],
              socketStatusData: socketData,
            },
          },
        },
      },
    };
  });
};
