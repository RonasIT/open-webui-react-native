import { chatQueriesKeys } from '../chat-queries-keys';
import { chatServiceConfig } from '../configs/chat-service-config';

export const getSearchChatsQueryKey = (text: string) => [
  ...chatServiceConfig.searchChatsQueryKey,
  ...chatQueriesKeys.searchInfinite({ query: text }).queryKey,
];
