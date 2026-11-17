import { plainToInstance } from 'class-transformer';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { ChatEventBase, ChatMessageFollowUpsData } from '@open-webui-react-native/shared/data-access/websocket';
import { chatQueriesKeys } from '../../chat-queries-keys';
import { ChatResponse } from '../../models';

export const handleChatMessageFollowUpsEvent = async (socketResponse: ChatEventBase): Promise<void> => {
  const { chatId, messageId } = socketResponse;
  const socketData = plainToInstance(ChatMessageFollowUpsData, socketResponse.data.data);

  const queryKey = chatQueriesKeys.get(chatId).queryKey;

  queryClient.setQueryData(queryKey, (draft: ChatResponse) => {
    if (!draft) return;

    // NOTE: Events come for every chat of the user, including replies generated on another device that
    // this cache does not have yet. Patching would add a stub message that the next save sends to the server.
    if (!draft.chat.messages || !draft.chat.history.messages[messageId]) {
      return draft;
    }

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
              followUps: socketData.followUps,
            },
          },
        },
        messages:
          messageIndex === -1
            ? draft.chat.messages
            : [
                ...draft.chat.messages.slice(0, messageIndex),
                {
                  ...draft.chat.messages[messageIndex],
                  followUps: socketData.followUps,
                },
                ...draft.chat.messages.slice(messageIndex + 1),
              ],
      },
    };
  });
};
