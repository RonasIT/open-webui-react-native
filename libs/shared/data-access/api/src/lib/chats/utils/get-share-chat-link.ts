import { getDisplayApiUrl } from '@open-webui-react-native/shared/utils/config';

export function getShareChatLink(shareId: string): string {
  return `${getDisplayApiUrl()}/s/${shareId}`;
}
