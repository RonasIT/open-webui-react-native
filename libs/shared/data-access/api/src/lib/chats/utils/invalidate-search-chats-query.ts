import { queryClient } from '@open-webui-react-native/shared/data-access/query-client';
import { chatServiceConfig } from '../configs';

export const invalidateSearchChatsQuery = (): void => {
  queryClient.invalidateQueries({ queryKey: chatServiceConfig.searchChatsQueryKey });
  queryClient.removeQueries({ queryKey: chatServiceConfig.searchChatsQueryKey, type: 'inactive' });
};
