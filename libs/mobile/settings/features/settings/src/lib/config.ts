import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

export const settingsApiConfig = {
  exportAllChatsApiURL: `${getApiUrl()}/api/v1/chats/all`,
  downloadFileName: 'chats_export.json',
};
