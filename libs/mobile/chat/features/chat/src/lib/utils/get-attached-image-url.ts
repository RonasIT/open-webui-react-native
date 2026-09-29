import { filesApiConfig } from '@open-webui-react-native/shared/data-access/api';
import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { isAbsoluteUrl } from '@open-webui-react-native/shared/utils/files';

// NOTE: An uploaded image stores its bare file id as `url` (the web app's shape), while older
// messages and temporary chats hold the picture inline as a `data:` URL.
export const getAttachedImageUrl = (url: string): string =>
  isAbsoluteUrl(url) ? url : `${getApiUrl()}${filesApiConfig.getFileContentRoute(url)}`;
