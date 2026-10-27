import { getApiUrl } from '@open-webui-react-native/shared/utils/config';
import { isAbsoluteUrl } from './is-absolute-url';

// NOTE: The server returns its own files as paths like `/api/v1/files/{id}/content`, which only load with its host.
// Anything else that is not absolute is not a server path, so it is left as is instead of being glued to the host.
export const resolveServerUrl = (source: string): string =>
  !isAbsoluteUrl(source) && source.startsWith('/') ? `${getApiUrl()}${source}` : source;
