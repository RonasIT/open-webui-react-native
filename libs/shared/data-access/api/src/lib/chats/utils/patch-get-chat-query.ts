import { merge } from 'lodash-es';
import { queryClient } from '@open-web-ui-mobile-client-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { ChatResponse } from '../models';

export const patchChatQueryData = (chatId: string, partialData: Partial<ChatResponse>): void => {
  queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey, (draft) => {
    if (!draft) {
      return undefined;
    }

    return merge({}, draft, partialData);
  });
};
