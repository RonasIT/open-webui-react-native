import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { ChatEventBase, ChatFilesData } from '@open-web-ui-mobile-client-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';

export const handleChatFilesEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const { chatId, messageId } = socketResponse;
  const socketData = plainToInstance(ChatFilesData, socketResponse.data.data);

  const queryKey = chatQueriesKeys.get(chatId).queryKey;

  queryClient.setQueryData(queryKey, (draft: ChatResponse) => {
    if (!draft) return;

    const messageIndex = draft.chat.messages.findIndex((message) => message.id === messageId);

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
              files: socketData.files,
            },
          },
        },
        messages: [
          ...draft.chat.messages.slice(0, messageIndex),
          {
            ...draft.chat.messages[messageIndex],
            files: socketData.files,
          },
          ...draft.chat.messages.slice(messageIndex + 1),
        ],
      },
    };
  });
};
