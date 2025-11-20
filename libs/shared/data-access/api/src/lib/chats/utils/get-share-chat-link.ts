import { getApiUrl } from '@open-web-ui-mobile-client-react-native/shared/utils/config';

export function getShareChatLink(shareId: string): string {
  return `${getApiUrl()}/s/${shareId}`;
}
