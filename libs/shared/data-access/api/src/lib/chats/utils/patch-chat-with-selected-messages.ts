import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { ChatResponse, Message } from '../models';

export const patchChatWithSelectedMessages = (chatId: string, currentId: string, messages: Array<Message>): void => {
  queryClient.setQueryData(chatQueriesKeys.get(chatId).queryKey, (draft: ChatResponse) => {
    if (!draft) return;

    return {
      ...draft,
      chat: {
        ...draft.chat,
        history: {
          ...draft.chat.history,
          currentId,
        },
        messages,
      },
    };
  });
};
