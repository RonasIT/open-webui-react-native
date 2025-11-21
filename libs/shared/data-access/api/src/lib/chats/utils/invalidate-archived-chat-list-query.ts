import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { archivedChatListQueryKey } from '../archived-chat-list-query-keys';
import { chatServiceConfig } from '../configs';

export const invalidateArchivedChatListQuery = (): void => {
  const queryCache = queryClient.getQueryCache();
  const searchInfiniteLiveQueries = queryCache.findAll({
    queryKey: archivedChatListQueryKey.searchInfinite().queryKey,
  });
  searchInfiniteLiveQueries.forEach((query) => {
    queryClient.invalidateQueries(query);
    queryClient.removeQueries({ queryKey: query.queryKey, type: 'inactive' });
  });
  queryClient.invalidateQueries({ queryKey: chatServiceConfig.getAllArchivedChatsQueryKey });
};
