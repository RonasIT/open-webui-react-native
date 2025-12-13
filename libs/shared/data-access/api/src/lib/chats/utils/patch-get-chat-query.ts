import { merge } from 'lodash-es';
import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatQueriesKeys } from '../chat-queries-keys';
import { ChatResponse } from '../models';

export const patchChatQueryData = (chatId: string, partialData: Partial<ChatResponse>): void => {
  queryClient.setQueryData<ChatResponse>(chatQueriesKeys.get(chatId).queryKey, (draft) => {
    if (!draft) {
      return undefined;
    }

    return new ChatResponse(merge({}, draft, partialData));
  });
};
