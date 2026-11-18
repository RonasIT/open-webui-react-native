import { getRequestHeaders } from '@open-webui-react-native/shared/data-access/api-client';
import { resolveServerUrl } from '@open-webui-react-native/shared/utils/files';

export interface ServerImageSource {
  uri: string;
  headers?: Record<string, string>;
}

export const getServerImageSource = (source: string): ServerImageSource => {
  const uri = resolveServerUrl(source);

  return { uri, headers: getRequestHeaders(uri) };
};
