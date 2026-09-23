import { chatQueriesKeys } from '../chat-queries-keys';
import { chatServiceConfig } from '../configs/chat-service-config';

export const getSearchChatsQueryKey = (
  text: string,
  options?: { includeFolders?: boolean; includePinned?: boolean },
) => [
  ...chatServiceConfig.searchChatsQueryKey,
  ...chatQueriesKeys.searchInfinite({ query: text }).queryKey,
  options?.includeFolders ?? false,
  options?.includePinned ?? false,
];
