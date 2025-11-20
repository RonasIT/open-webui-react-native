import { chatQueriesKeys, ChatResponse } from '@open-web-ui-mobile-client-react-native/shared/data-access/api';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';

export const patchNewChat = (id: string): void => {
  queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(id).queryKey, (draft) => {
    if (draft && draft.chat?.history?.messages) {
      const { history } = draft.chat;

      const message = history.messages[history.currentId];

      if (message) {
        message.done = false;
      }
    }

    return draft;
  });
};
