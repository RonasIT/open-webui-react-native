import { getApiUrl } from '@open-webui-react-native/shared/utils/config';

export function getShareChatLink(shareId: string): string {
  return `${getApiUrl()}/s/${shareId}`;
}
