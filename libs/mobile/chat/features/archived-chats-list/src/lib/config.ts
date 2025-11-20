import { getApiUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/config';

export const archivedChatsApiConfig = {
  exportAllChatsApiURL: `${getApiUrl()}/api/v1/chats/all/archived`,
  downloadFileName: 'archived_chats.json',
};
